// static/evaluate.js
$('#url-field, #user-selection-field').keypress(function (e) {
    if (e.which === 13) {
        // 13 is the key code for Enter
        submitForm();
    }
});

function submitForm() {
    const inputField = $('#url-field').val();
    const optionField = $('#user-selection-field').val();
    const resultDiv = $('#result');
    $("#analyzing").show();
    $("#results").hide();
    try {
        let ci_table;

        $.ajax({
            url: '/process_form',
            type: 'POST',
            data: { url_field: inputField, user_field: optionField },
            success: function (data) {
                ci_table = data["code-improvements"];
                generateHTMLTable(ci_table);

                $("#results").show();
                $("#analyzing").hide();
            },
        });

    } catch (error) {
        console.error('Error:', error);
        resultDiv.text('Error occurred during form submission.');

    }
}

function generateHTMLTable(ci_table) {
    var tableHTML = '<table>';

    for (var i = 0; i < ci_table.length; i++) {
        var row = ci_table[i];
        tableHTML += '<tr><td><div class="ci-description">' + row[1] + '</div><div class="ci-suggestion">' + row[2] + '</div></td><td class="ci-count">' + row[0] + ' x</td></tr>';
    }

    tableHTML += '</table>';

    $('#code-improvements table').replaceWith(tableHTML);
}

