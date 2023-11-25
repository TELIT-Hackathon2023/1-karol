function submitForm() {
    const inputField = $('#input_field').val();
    const resultDiv = $('#result');

    try {
        $.ajax({
            url: '/process_form',
            type: 'POST',
            data: { input_field: inputField },
            success: function (data) {
                console.log(data);
            },
            error: function (error) {
                console.error('Error:', error);
                resultDiv.text('Error occurred during form submission.');
            }
        });
    } catch (error) {
        console.error('Error:', error);
        resultDiv.text('Error occurred during form submission.');
    }
}
