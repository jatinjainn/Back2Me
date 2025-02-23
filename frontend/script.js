const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const { createClient } = supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById('itemForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const status = document.getElementById('status').value;

    const { data, error } = await supabase
        .from('items')
        .insert([{ title, description, status }]);

    if (error) {
        console.error('Error inserting item:', error);
    } else {
        console.log('Item inserted:', data);
        loadItems(); // Reload items after submission
    }

    document.getElementById('itemForm').reset();
});

async function loadItems() {
    const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading items:', error);
    } else {
        const itemsList = document.getElementById('itemsList');
        itemsList.innerHTML