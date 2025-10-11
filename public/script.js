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
