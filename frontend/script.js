// Initialize Supabase client
const SUPABASE_URL = 'https://zjfvltevplcdauogaexk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZnZsdGV2cGxjZGF1b2dhZXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyODU0NTIsImV4cCI6MjA1NTg2MTQ1Mn0.aoOhebkPtpXJcCxbXOLvp0eyKHJd3WsSWZg6hy0xcxA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Load items from database based on status
async function loadItems(status = null) {
    let query = supabase.from('items').select('*').order('created_at', { ascending: false });

    if (status) {
        query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error loading items:', error);
        return;
    }

    const itemsList = document.getElementById('itemsList');
    if (!itemsList) return;
    itemsList.innerHTML = ''; // Clear previous list

    data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item');

        itemDiv.innerHTML = `
            <h3>${item.title} (${item.status})</h3>
            <p>${item.description}</p>
            <p><strong>Contact:</strong> ${item.contact_info}</p>
            ${item.image_url ? `<img src="${item.image_url}" alt="Item Image" style="max-width: 100%;">` : '<small>No image uploaded</small>'}
            <small>Posted on: ${new Date(item.created_at).toLocaleString()}</small>
        `;

        itemsList.appendChild(itemDiv);
    });
}

// Upload image to Supabase Storage and return the URL
async function uploadImage(imageFile, status) {
    if (!imageFile) return null; // No image uploaded, return null

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const bucket = status === 'Lost' ? 'lost-items' : 'found-items';

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, imageFile, { cacheControl: '3600', upsert: false });

    if (error) {
        console.error('Image upload failed:', error);
        return null;
    }

    // Retrieve public URL of the uploaded image
    const { data: publicURLData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return publicURLData.publicUrl; // Return the image URL
}

// Add new item with image upload (optional)
async function addItem(event, status) {
    event.preventDefault();

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const contact_info = document.getElementById('contact_info').value.trim();
    const imageInput = document.getElementById('image').files[0];

    if (!title || !description || !contact_info) {
        alert("Please fill in all required fields before submitting.");
        return;
    }

    let imageUrl = null;
    if (imageInput) {
        imageUrl = await uploadImage(imageInput, status);
        if (!imageUrl) {
            alert('Image upload failed. Please try again.');
            return;
        }
    }

    const { error } = await supabase.from('items').insert([{ 
        title, 
        description, 
        contact_info, 
        status, 
        image_url: imageUrl || null  
    }]);

    if (error) {
        console.error('Error adding item:', error);
        alert(`Failed to add item: ${error.message}`);
        return;
    }

    alert('Item added successfully!');
    loadItems(status);
    document.getElementById('itemForm').reset();
}

// Attach form submission event listeners based on the page type
document.addEventListener("DOMContentLoaded", function () {
    const itemForm = document.getElementById('itemForm');
    if (itemForm) {
        if (document.body.classList.contains('lost-page')) {
            itemForm.addEventListener('submit', (event) => addItem(event, 'Lost'));
            loadItems('Lost');
        } else if (document.body.classList.contains('found-page')) {
            itemForm.addEventListener('submit', (event) => addItem(event, 'Found'));
            loadItems('Found');
        } else {
            loadItems(); // Load all items for recent.html
        }
    }
});
