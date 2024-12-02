const form = document.querySelector('#manageSupplyForm');
const inputs = Array.from(document.querySelectorAll('.form-control, .form-select'));

const sendData = async (inventory) => {
    try {
        const response = await fetch('http://localhost:3000/api/inventory', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify(inventory)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add inventory item');
        }

        const result = await response.json();
        return result;

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

form.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent page reload

    const date = inputs[0].value;
    const supplyName = inputs[1].value;
    const quantity = parseInt(inputs[2].value, 10); // Ensure numeric input
    const supplyType = inputs[3].value;

    if (!date || !supplyName || !quantity || !supplyType) {
        alert('All fields are required!');
        return;
    }

    const inventory = {
        date: date,
        supplyName: supplyName,
        quantity: quantity,
        supplyType: supplyType
    };

    sendData(inventory).then(result => {
        console.log('Inventory item added:', result);
        alert('Inventory item added successfully!');
        form.reset(); // Reset form inputs
    }).catch(error => {
        console.error('Error adding inventory:', error);
    });
});
