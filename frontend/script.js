// Open modal when clicking "Report Lost Item" button
document.querySelectorAll("#openFormButton").forEach(button => {
    button.addEventListener("click", function() {
        document.getElementById("reportModal").style.display = "flex";
    });
});

// Close modal when clicking the close button
document.querySelector(".close").addEventListener("click", function() {
    document.getElementById("reportModal").style.display = "none";
});

// Preview Image Before Upload
document.getElementById('itemImage').addEventListener('change', function(event) {
    let reader = new FileReader();
    reader.onload = function() {
        document.getElementById('preview').innerHTML = `<img src="${reader.result}" width="100" height="100" style="border-radius:5px;">`;
    };
    reader.readAsDataURL(event.target.files[0]);
});

// Handle form submission
document.getElementById('lostFoundForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(this); // Capture form data including file

    try {
        const response = await fetch('/api/items', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Item saved:', result);

            // Refresh item list and reset form
            fetchItems();
            document.getElementById('reportModal').style.display = 'none'; // Close modal
            this.reset(); // Reset form
            document.getElementById('preview').innerHTML = ''; // Clear image preview
        } else {
            console.error('Error saving item:', response.statusText);
            alert('Failed to add item. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while adding the item.');
    }
});

// Fetch and display items
async function fetchItems() {
    try {
        const response = await fetch('/api/items');
        const items = await response.json();
        const itemsList = document.getElementById('itemsList');
        itemsList.innerHTML = ''; // Clear previous items

        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('item');
            itemElement.innerHTML = `
                <h3>${item.reportType}</h3>
                <img src="${item.imageUrl || 'placeholder.jpg'}" alt="Item Image" width="100" height="100" style="border-radius:5px;">
                <p><strong>Type:</strong> ${item.articleType}</p>
                <p><strong>Location:</strong> ${item.location}</p>
                <p><strong>Date:</strong> ${new Date(item.lostFoundDate).toLocaleString()}</p>
                <p>${item.description}</p>
            `;
            itemsList.appendChild(itemElement);
        });
    } catch (error) {
        console.error('Error fetching items:', error);
    }
}

// Load items on page load
window.onload = fetchItems;
