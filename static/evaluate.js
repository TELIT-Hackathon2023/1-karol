// static/evaluate.js

function submitForm() {
    const inputField = $('#url-field').val();
    const resultDiv = $('#result');

    try {
        $.ajax({
            url: '/process_form',
            type: 'POST',
            data: { url_field: inputField },
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

