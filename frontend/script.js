// Initialize Supabase client
const SUPABASE_URL = 'https://zjfvltevplcdauogaexk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZnZsdGV2cGxjZGF1b2dhZXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyODU0NTIsImV4cCI6MjA1NTg2MTQ1Mn0.aoOhebkPtpXJcCxbXOLvp0eyKHJd3WsSWZg6hy0xcxA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Load items (Modified to show all items in recent.html)
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
    itemsList.innerHTML = '';

    if (data.length === 0) {
        itemsList.innerHTML = '<p>No items found.</p>';
        return;
    }

    data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item');

        itemDiv.innerHTML = `
            <h3>${item.title} (${item.status})</h3>
            <p>${item.description}</p>
            <p><strong>Contact:</strong> ${item.contact_info}</p>
            ${item.image_url ? `<img src="${item.image_url}" alt="Item Image" style="max-width: 100%;">` : ''}
            <small>Posted on: ${new Date(item.created_at).toLocaleString()}</small>
        `;

        itemsList.appendChild(itemDiv);
    });
}

// Add a new item with image upload (Fixed image upload)
async function addItem(event, status) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const contact_info = document.getElementById('contact_info').value;
    const imageInput = document.getElementById('image').files[0];

    let imageUrl = null;

    // Upload image if selected
    if (imageInput) {
        const fileExt = imageInput.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const bucket = status === 'Lost' ? 'lost-items' : 'found-items';

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, imageInput);

        if (error) {
            console.error('Error uploading image:', error);
            alert('Image upload failed. Please check your file and try again.');
            return;
        }

        if (data) {
            imageUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`;
            console.log('Image uploaded successfully:', imageUrl);
        }
    }

    // Insert item into database
    const { error: insertError } = await supabase.from('items').insert([{ 
        title, 
        description, 
        contact_info, 
        status, 
        image_url: imageUrl || null  
    }]);

    if (insertError) {
        console.error('Error adding item:', insertError);
    } else {
        alert('Item added successfully!');
        loadItems(status);
        document.getElementById('itemForm').reset();
    }
}

// Attach event listeners based on page type
if (document.body.classList.contains('lost-page')) {
    document.getElementById('itemForm').addEventListener('submit', (event) => addItem(event, 'Lost'));
    loadItems('Lost');
} else if (document.body.classList.contains('found-page')) {
    document.getElementById('itemForm').addEventListener('submit', (event) => addItem(event, 'Found'));
    loadItems('Found');
} else {
    loadItems(); // Load all items on recent.html
}
