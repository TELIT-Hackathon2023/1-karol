// static/evaluate.js

function submitForm() {
    const inputField = $('#url-field').val();
    const optionField = $('#user-selection-field').val();
    const resultDiv = $('#result');

    try {
        $.ajax({
            url: '/process_form',
            type: 'POST',
            data: { url_field: inputField, user_field: optionField },
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

