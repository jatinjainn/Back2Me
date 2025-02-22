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
    event.preventDefault(); // Prevent the default form submission

    const reportType = document.getElementById('reportType').value;
    const articleType = document.getElementById('articleType').value;
    const lostFoundDate = document.getElementById('lostFoundDate').value;
    const location = document.getElementById('location').value;
    const description = document.getElementById('description').value;

    // Create a FormData object to handle file uploads
    const formData = new FormData();
    formData.append('reportType', reportType);
    formData.append('articleType', articleType);
    formData.append('lostFoundDate', lostFoundDate);
    formData.append('location', location);
    formData.append('description', description);
    formData.append('itemImage', document.getElementById('itemImage').files[0]);

    try {
        const response = await fetch('http://localhost:5000/api/items', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Item added:', data);
            loadItems(); // Refresh the item list
            document.getElementById('reportModal').style.display = 'none'; // Close the modal
            document.getElementById('lostFoundForm').reset(); // Reset the form
            document.getElementById('preview').innerHTML = ''; // Clear the image preview
        } else {
            const errorData = await response.json();
            console.error('Error adding item:', errorData);
            alert('Failed to add item: ' + errorData.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while adding the item.');
    }
});

// Load items from the backend
async function loadItems() {
    try {
        const response = await fetch('http://localhost:5000/api/items');
        const items = await response.json();
        const itemsList = document.getElementById('itemsList');
        itemsList.innerHTML = ''; // Clear the list before adding new items
        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item');
            itemDiv.innerHTML = `
                <img src="${item.imageUrl || 'placeholder.jpg'}" alt="${item.title}" style="width:100px; height:100px; border-radius:5px;">
                <p>${item.title} - ${item.location}</p>
                <p>${item.description}</p>
                <p><strong>Type:</strong> ${item.articleType}</p>
                <p><strong>Date:</strong> ${new Date(item.lostFoundDate).toLocaleString()}</p>
            `;
            itemsList.appendChild(itemDiv);
        });
    } catch (error) {
        console.error('Error loading items:', error);
    }
}

// Load items on page load
window.onload = loadItems;