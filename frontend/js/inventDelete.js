document.addEventListener('DOMContentLoaded', loadInventories);


document.querySelectorAll('.deleteBtn').forEach(button => {
    button.addEventListener('click', async (event) => {
        const id = event.target.closest('tr').dataset.id;
        if (confirm('Are you sure you want to delete this?')) {
            try {
                const response = await fetch(`/api/inventories/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    loadInventories();
                }
            } catch (error) {
                console.error('Error deleting inventory:', error);
            }
        }
    });
});
