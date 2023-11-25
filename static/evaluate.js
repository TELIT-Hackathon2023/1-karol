// static/evaluate.js

function submitForm() {
    const inputField = $('#url-field').val();
    const optionField = $('#user-selection-field').val();
    const resultDiv = $('#result');

    try {
        let ci_table;

        $.ajax({
            url: '/process_form',
            type: 'POST',
            data: { url_field: inputField, user_field: optionField },
            success: function (data) {
                ci_table = data["code-improvements"]
                generateHTMLTable(ci_table)
            },
        });

    } catch (error) {
        console.error('Error:', error);
        resultDiv.text('Error occurred during form submission.');
    }
}

function generateHTMLTable(ci_table) {
    var tableHTML = '<table><tr><th>Count</th><th>Description</th><th>Suggestion</th></tr>';

    for (var i = 0; i < ci_table.length; i++) {
        var row = ci_table[i];
        tableHTML += '<tr><td>' + row[0] + '</td><td>' + row[1] + '</td><td>' + row[2] + '</td></tr>';
    }

    tableHTML += '</table>';

    $('#code-improvements table').replaceWith(tableHTML);
}

