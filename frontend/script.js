// Initialize Supabase client
const SUPABASE_URL = 'https://zjfvltevplcdauogaexk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZnZsdGV2cGxjZGF1b2dhZXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyODU0NTIsImV4cCI6MjA1NTg2MTQ1Mn0.aoOhebkPtpXJcCxbXOLvp0eyKHJd3WsSWZg6hy0xcxA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Load items based on status
async function loadItems(status) {
    const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading items:', error);
        return;
    }

    const itemsList = document.getElementById('itemsList');
    itemsList.innerHTML = '';

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

// Add a new item to the database with image upload
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
            return;
        }

        imageUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`;
    }

    // Insert item into database
    const { error } = await supabase.from('items').insert([{ 
        title, 
        description, 
        contact_info, 
        status, 
        image_url: imageUrl || null  
    }]);

    if (error) {
        console.error('Error adding item:', error);
    } else {
        loadItems(status);
        document.getElementById('itemForm').reset();
    }
}

// Attach correct event listeners
if (document.body.classList.contains('lost-page')) {
    document.getElementById('itemForm').addEventListener('submit', (event) => addItem(event, 'Lost'));
    loadItems('Lost');
} else if (document.body.classList.contains('found-page')) {
    document.getElementById('itemForm').addEventListener('submit', (event) => addItem(event, 'Found'));
    loadItems('Found');
} else {
    loadItems(); // Load all items on recent.html
}
