// Load JSON file
fetch('consoles.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Hide loading indicator
        document.getElementById('loading').style.display = 'none';
        
        // Sort consoles by release year
        data.consoles.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));

        // Get current date
        const currentDate = new Date();
        
        // Create table
        const table = document.createElement('table');
        const headerRow = document.createElement('tr');
        
        // Create table headers
        const headers = ['Console', 'Release Date', 'Age'];
        headers.forEach(headerText => {
            const header = document.createElement('th');
            header.textContent = headerText;
            headerRow.appendChild(header);
        });
        table.appendChild(headerRow);
        
        // Populate table with console data
        data.consoles.forEach(console => {
            const row = document.createElement('tr');
            
            // Console name and manufacturer
            const nameCell = document.createElement('td');
            nameCell.innerHTML = `
                <div class="console-name">${console.name}</div>
                <div class="manufacturer">${console.manufacturer}</div>
            `;
            row.appendChild(nameCell);
            
            // Release date
            const yearCell = document.createElement('td');
            const releaseDate = new Date(console.release_date);
            const formattedDate = releaseDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short'
            });
            yearCell.innerHTML = `<span class="release-date">${formattedDate}</span>`;
            row.appendChild(yearCell);
            
            // Age calculation
            const ageCell = document.createElement('td');
            let ageYears = currentDate.getFullYear() - releaseDate.getFullYear();
            let ageMonths = currentDate.getMonth() - releaseDate.getMonth();
            
            if (ageMonths < 0) {
                ageYears--;
                ageMonths += 12;
            }

            // Add age category class for styling
            let ageClass = 'modern';
            if (ageYears > 30) {
                ageClass = 'vintage';
            } else if (ageYears > 10) {
                ageClass = 'retro';
            }

            const ageText = ageYears > 0 
                ? `${ageYears} years, ${ageMonths} months`
                : `${ageMonths} months`;
            
            ageCell.innerHTML = `<span class="age ${ageClass}">${ageText}</span>`;
            row.appendChild(ageCell);
            
            table.appendChild(row);
        });
        
        // Show content and append table
        const contentDiv = document.getElementById('content');
        contentDiv.appendChild(table);
        // NEW 4/15
        // Add button to add a new console
        const addButton = document.createElement('button');
        addButton.textContent = 'Add Console';
        addButton.id = 'add-console-btn';
        addButton.onclick = () => openModal();
        contentDiv.appendChild(addButton);
        //END NEW 4/15
        
        contentDiv.style.display = 'block';
    })
    .catch(error => {
        console.error('Error loading JSON:', error);
        document.getElementById('loading').style.display = 'none';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.innerHTML = `
            <h3>Error Loading Console Data</h3>
            <p>Unable to load console information. Please check that the consoles.json file is available.</p>
            <p><small>Error: ${error.message}</small></p>
        `;
        
        document.getElementById('content').appendChild(errorDiv);
        document.getElementById('content').style.display = 'block';
    });

    // NEW 4/15
// Function to open modal for adding console
function openModal() {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'add-console-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.width = '400px';
    modalContent.style.maxWidth = '90%';
    
    // Form
    const form = document.createElement('form');
    form.id = 'add-console-form';
    
    // Console Name
    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Console Name:';
    nameLabel.htmlFor = 'console-name';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'console-name';
    nameInput.required = true;
    
    // // Manufacturer
    const manufacturerLabel = document.createElement('label');
    manufacturerLabel.textContent = 'Manufacturer:';
    manufacturerLabel.htmlFor = 'manufacturer';
    const manufacturerInput = document.createElement('input');
    manufacturerInput.type = 'text';
    manufacturerInput.id = 'manufacturer';
    manufacturerInput.required = true;
    
    // Release Date
    const dateLabel = document.createElement('label');
    dateLabel.textContent = 'Release Date:';
    dateLabel.htmlFor = 'release-date';
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.id = 'release-date';
    dateInput.required = true;
    
    // Image URL (optional)
    const imageLabel = document.createElement('label');
    imageLabel.textContent = 'Image URL (optional):';
    imageLabel.htmlFor = 'image-url';
    const imageInput = document.createElement('input');
    imageInput.type = 'url';
    imageInput.id = 'image-url';
    
    // Buttons
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Add Console';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => document.body.removeChild(modal);
    
    // Append elements
    form.appendChild(nameLabel);
    form.appendChild(nameInput);
    form.appendChild(document.createElement('br'));
    form.appendChild(manufacturerLabel);
    form.appendChild(manufacturerInput);
    form.appendChild(document.createElement('br'));
    form.appendChild(dateLabel);
    form.appendChild(dateInput);
    form.appendChild(document.createElement('br'));
    form.appendChild(imageLabel);
    form.appendChild(imageInput);
    form.appendChild(document.createElement('br'));
    form.appendChild(submitBtn);
    form.appendChild(cancelBtn);
    
    modalContent.appendChild(form);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Form submit handler
    form.onsubmit = async (e) => {
        e.preventDefault();
        const newConsole = {
            console: nameInput.value,
            manufacturer: manufacturerInput.value,
            release_date: dateInput.value,
            image_url: imageInput.value || 'https://example.com/default.png'
        };
        
        try {
            const response = await fetch('/add-console', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newConsole)
            });
            if (response.ok) {
                alert('Console added successfully!');
                document.body.removeChild(modal);
                location.reload(); // Reload to show updated list
            } else {
                alert('Error adding console.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding console.');
        }
    };  //END NEW 4/15
}
