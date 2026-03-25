class CVMaker {
    constructor() {
        this.skills = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.updatePreview();
        this.loadFromLocalStorage();
    }

    bindEvents() {
        // Form inputs
        document.querySelectorAll('#cvForm input, #cvForm textarea').forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
        });

        // Add experience
        document.getElementById('addExperience').addEventListener('click', () => {
            this.addExperienceItem();
        });

        // Add education
        document.getElementById('addEducation').addEventListener('click', () => {
            this.addEducationItem();
        });

        // Skills
        document.getElementById('addSkill').addEventListener('click', () => {
            this.addSkill();
        });
        document.getElementById('skillInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addSkill();
        });

        // Download buttons
        document.getElementById('downloadPDF').addEventListener('click', () => {
            this.downloadPDF();
        });

        document.getElementById('copyHTML').addEventListener('click', () => {
            this.copyHTML();
        });

        // Handle dynamic inputs
        document.addEventListener('input', (e) => {
            if (e.target.closest('.experience-item, .education-item')) {
                this.updatePreview();
            }
        });
    }

    addExperienceItem() {
        const container = document.getElementById('experienceItems');
        const item = document.createElement('div');
        item.className = 'experience-item';
        item.innerHTML = `
            <div class="form-row">
                <input type="text" class="jobTitle" placeholder="Job Title">
                <input type="text" class="company" placeholder="Company">
            </div>
            <div class="form-row">
                <input type="text" class="jobDates" placeholder="Dates (e.g., 2020 - Present)">
                <textarea class="jobDesc" rows="2" placeholder="Description"></textarea>
            </div>
            <button type="button" class="remove-btn">Remove</button>
        `;
        item.querySelector('.remove-btn').addEventListener('click', () => {
            item.remove();
            this.updatePreview();
        });
        item.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
        });
        container.appendChild(item);
        this.updatePreview();
    }

    addEducationItem() {
        const container = document.getElementById('educationItems');
        const item = document.createElement('div');
        item.className = 'education-item';
        item.innerHTML = `
            <div class="form-row">
                <input type="text" class="degree" placeholder="Degree">
                <input type="text" class="school" placeholder="School">
            </div>
            <input type="text" class="eduDates" placeholder="Dates (e.g., 2018 - 2022)">
            <button type="button" class="remove-btn">Remove</button>
        `;
        item.querySelector('.remove-btn').addEventListener('click', () => {
            item.remove();
            this.updatePreview();
        });
        item.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
        });
        container.appendChild(item);
        this.updatePreview();
    }

    addSkill() {
        const input = document.getElementById('skillInput');
        const skill = input.value.trim();
        if (skill && !this.skills.includes(skill)) {
            this.skills.push(skill);
            input.value = '';
            this.renderSkills();
            this.updatePreview();
        }
    }

    renderSkills() {
        const container = document.getElementById('skillsList');
        container.innerHTML = '';
        this.skills.forEach((skill, index) => {
            const tag = document.createElement('div');
            tag.className = 'skill-tag';
            tag.innerHTML = `
                ${skill}
                <button class="skill-remove" data-index="${index}">&times;</button>
            `;
            tag.querySelector('.skill-remove').addEventListener('click', () => {
                this.skills.splice(index, 1);
                this.renderSkills();
                this.updatePreview();
            });
            container.appendChild(tag);
        });
    }

    updatePreview() {
        const preview = document.getElementById('cvPreview');
        const formData = this.getFormData();
        
        preview.innerHTML = `
            <div class="cv-header">
                <h1>${formData.fullName || 'Your Name'}</h1>
                <div class="contact-info">
                    ${formData.phone ? `<span class="contact-item"><i class="fas fa-phone"></i> ${formData.phone}</span>` : ''}
                    ${formData.email ? `<span class="contact-item"><i class="fas fa-envelope"></i> ${formData.email}</span>` : ''}
                    ${formData.location ? `<span class="contact-item"><i class="fas fa-map-marker-alt"></i> ${formData.location}</span>` : ''}
                    ${formData.linkedin ? `<span class="contact-item"><i class="fab fa-linkedin"></i> <a href="${formData.linkedin}" target="_blank">${formData.linkedin}</a></span>` : ''}
                    ${formData.portfolio ? `<span class="contact-item"><i class="fas fa-globe"></i> <a href="${formData.portfolio}" target="_blank">${formData.portfolio}</a></span>` : ''}
                </div>
            </div>

            ${formData.summary ? `
                <div class="summary">
                    <p>${formData.summary.replace(/\n/g, '<br>')}</p>
                </div>
            ` : ''}

            ${formData.experience.length ? `
                <h2><i class="fas fa-briefcase"></i> Work Experience</h2>
                ${formData.experience.map(exp => `
                    <div class="experience">
                        <h3>${exp.jobTitle} at <strong>${exp.company}</strong></h3>
                        <p class="job-dates">${exp.jobDates}</p>
                        ${exp.jobDesc ? `<p>${exp.jobDesc.replace(/\n/g, '<br>')}</p>` : ''}
                    </div>
                `).join('')}
            ` : ''}

            ${formData.education.length ? `
                <h2><i class="fas fa-graduation-cap"></i> Education</h2>
                ${formData.education.map(edu => `
                    <div class="education">
                        <h3>${edu.degree} - ${edu.school}</h3>
                        <p class="job-dates">${edu.eduDates}</p>
                    </div>
                `).join('')}
            ` : ''}

            ${formData.skills.length ? `
                <h2><i class="fas fa-tools"></i> Skills</h2>
                <div class="skills-grid">
                    ${formData.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            ` : ''}
        `;

        this.saveToLocalStorage();
    }

    getFormData() {
        return {
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            location: document.getElementById('location').value,
            linkedin: document.getElementById('linkedin').value,
            portfolio: document.getElementById('portfolio').value,
            summary: document.getElementById('summary').value,
            experience: Array.from(document.querySelectorAll('.experience-item')).map(item => ({
                jobTitle: item.querySelector('.jobTitle').value,
                company: item.querySelector('.company').value,
                jobDates: item.querySelector('.jobDates').value,
                jobDesc: item.querySelector('.jobDesc').value
            })).filter(exp => exp.jobTitle || exp.company),
            education: Array.from(document.querySelectorAll('.education-item')).map(item => ({
                degree: item.querySelector('.degree').value,
                school: item.querySelector('.school').value,
                eduDates: item.querySelector('.eduDates').value
            })).filter(edu => edu.degree || edu.school),
            skills: this.skills
        };
    }

    downloadPDF() {
        window.print();
    }

    copyHTML() {
        const formData = this.getFormData();
        const htmlContent = this.generateCleanHTML(formData);
        
        navigator.clipboard.writeText(htmlContent).then(() => {
            const btn = document.getElementById('copyHTML');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            btn.style.background = '#10b981';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '#6b7280';
            }, 2000);
        });
    }

    generateCleanHTML(data) {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>${data.fullName || 'Resume'}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #333; }
        h1 { font-size: 2.5em; margin-bottom: 10px; }
        .contact-info { margin-bottom: 30px; }
        .contact-item { margin-right: 20px; display: inline-block; }
        h2 { border-bottom: 2px solid #667eea; padding-bottom: 8px; margin: 30px 0 20px 0; }
        .job-dates { color: #667eea; font-weight: bold; }
        .skills-grid { display: flex; flex-wrap: wrap; gap: 10px; }
        .skill-tag { background: #f0f4ff; color: #667eea; padding: 6px 14px; border-radius: 20px; }
    </style>
</head>
<body>
    ${document.getElementById('cvPreview').innerHTML}
</body>
</html>`;
    }

    saveToLocalStorage() {
        localStorage.setItem('cvData', JSON.stringify(this.getFormData()));
        localStorage.setItem('cvSkills', JSON.stringify(this.skills));
    }

    loadFromLocalStorage() {
        const data = localStorage.getItem('cvData');
        const skills = localStorage.getItem('cvSkills');
        if (data) {
            const formData = JSON.parse(data);
            document.getElementById('fullName').value = formData.fullName || '';
            document.getElementById('phone').value = formData.phone || '';
            document.getElementById('email').value = formData.email || '';
            document.getElementById('location').value = formData.location || '';
            document.getElementById('linkedin').value = formData.linkedin || '';
            document.getElementById('portfolio').value = formData.portfolio || '';
            document.getElementById('summary').value = formData.summary || '';
            
            if (skills) {
                this.skills = JSON.parse(skills);
                this.renderSkills();
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CVMaker();
});
