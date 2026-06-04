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
        const headers = ['Console', 'Manufacturer', 'Release Date', 'Age', 'Actions'];
        headers.forEach(headerText => {
            const header = document.createElement('th');
            header.textContent = headerText;
            headerRow.appendChild(header);
        });
        table.appendChild(headerRow);
        
        // Populate table with console data
        data.consoles.forEach((consoleItem, index) => {
            const row = document.createElement('tr');

            const nameCell = document.createElement('td');
            nameCell.textContent = consoleItem.name || consoleItem.console || '';
            row.appendChild(nameCell);

            const manufacturerCell = document.createElement('td');
            manufacturerCell.textContent = consoleItem.manufacturer || '';
            row.appendChild(manufacturerCell);

            const dateCell = document.createElement('td');
            dateCell.textContent = consoleItem.release_date || '';
            row.appendChild(dateCell);

            const ageCell = document.createElement('td');
            ageCell.textContent = consoleItem.age || '';
            ageCell.className = 'age';
            row.appendChild(ageCell);

            const actionCell = document.createElement('td');
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit-console-btn';
            editButton.addEventListener('click', () => openEditModal(consoleItem, index, row));
            actionCell.appendChild(editButton);
            row.appendChild(actionCell);

            table.appendChild(row);
        });
        
        // Show content and append table
        const contentDiv = document.getElementById('content');


        // NEW 4/15
        // Add button to add a new console
        const addButton = document.createElement('button');
        addButton.textContent = 'Add Console';
        addButton.id = 'add-console-btn';
        addButton.onclick = () => openModal();
        contentDiv.appendChild(addButton);
        //END NEW 4/15

        contentDiv.appendChild(table);

        
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
            name: nameInput.value,
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

function openEditModal(consoleItem, index, row) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const title = document.createElement('h2');
    title.textContent = 'Edit Console';
    modalContent.appendChild(title);

    function createField(labelText, type, value) {
        const label = document.createElement('label');
        label.textContent = labelText;
        const input = document.createElement('input');
        input.type = type;
        input.value = value || '';
        input.required = true;
        label.appendChild(input);
        modalContent.appendChild(label);
        return input;
    }

    const consoleInput = createField('Console', 'text', consoleItem.name || consoleItem.console || '');
    const manufacturerInput = createField('Manufacturer', 'text', consoleItem.manufacturer || '');
    const releaseInput = createField('Release Date', 'date', consoleItem.release_date || '');

    const buttonRow = document.createElement('div');
    buttonRow.className = 'modal-actions';

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => document.body.removeChild(modal));

    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', async () => {
        if (!consoleInput.value.trim() || !manufacturerInput.value.trim() || !releaseInput.value) {
            alert('Please fill in all fields.');
            return;
        }

        const idx = Number(index); // ensure numeric
        const payload = {
            index: idx,
            name: consoleInput.value.trim(),
            manufacturer: manufacturerInput.value.trim(),
            release_date: releaseInput.value,
            image_url: consoleItem.image_url || 'https://example.com/default.png'
        };

        console.log('update-console payload', payload);

        try {
            const response = await fetch('/update-console', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                alert(error.error || 'Unable to save changes');
                return;
            }

            const updated = await response.json();
            consoleItem.name = updated.name;
            consoleItem.manufacturer = updated.manufacturer;
            consoleItem.release_date = updated.release_date;
            consoleItem.image_url = updated.image_url;

            row.children[0].textContent = updated.name;
            row.children[1].textContent = updated.manufacturer;
            row.children[2].textContent = updated.release_date;

            document.body.removeChild(modal);
        } catch (err) {
            console.error(err);
            alert('Could not save console changes.');
        }
    });

    buttonRow.append(cancelButton, saveButton);
    modalContent.appendChild(buttonRow);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}
