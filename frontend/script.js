// Initialize Supabase client
const SUPABASE_URL = 'https://zjfvltevplcdauogaexk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZnZsdGV2cGxjZGF1b2dhZXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyODU0NTIsImV4cCI6MjA1NTg2MTQ1Mn0.aoOhebkPtpXJcCxbXOLvp0eyKHJd3WsSWZg6hy0xcxA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Load items from the database
async function loadItems() {
    const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading items:', error);
    } else {
        const itemsList = document.getElementById('itemsList');
        itemsList.innerHTML = ''; // Clear the list before adding new items

        data.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item');
            itemDiv.innerHTML = `
                <h3>${item.title} (${item.status})</h3>
                <p>${item.description}</p>
                <small>Posted on: ${new Date(item.created_at).toLocaleString()}</small>
            `;
            itemsList.appendChild(itemDiv);
        });
    }
}

// Add a new item to the database
async function addItem(event) {
    event.preventDefault(); // Prevent form submission

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const status = document.getElementById('status').value;

    const { error } = await supabase.from('items').insert([{ title, description, status }]);

    if (error) {
        console.error('Error adding item:', error);
    } else {
        loadItems(); // Reload items after adding a new one
        document.getElementById('itemForm').reset(); // Reset the form
    }
}

// Event listener for form submission
document.getElementById('itemForm').addEventListener('submit', addItem);

// Load items on page load
loadItems();
