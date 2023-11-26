// static/evaluate.js

const browsers = ['chrome', 'edge', 'firefox', 'ie', 'safari']
let submitting = false
$('#url-field, #user-selection-field').keypress(function (e) {
    if (e.which === 13 && $('#url-field') !== '') {
        // 13 is the key code for Enter
        submitForm();
    }
});

function inputOnChange() {
    const submitButton = $('#form-submit-button')
    const inputField = $('#url-field')
    if (inputField.val() === '') {
        submitButton.prop('disabled', true);
    } else if (inputField.val() !== '' && !submitting) {
        submitButton.prop('disabled', false);
    }
}

function submitForm() {
    const endSubmitting = (success) => {
        if (success) {
            $("#results").show();
        }
        $("#analyzing").hide();
        submitting = false
        submitButton.prop('disabled', false);
    }
    const submitButton = $('#form-submit-button');
    submitButton.prop('disabled', true);
    submitting = true
    const inputField = $('#url-field').val();
    const optionField = $('#user-selection-field').val();
    const resultDiv = $('#result');
    $("#analyzing").show();
    $("#results").hide();
    try {
        let ci_table;
        let css_table;
        let domain;
        let semantics_table;
        let persona_table;
        let score;

        $.ajax({
            url: '/process_form',
            type: 'POST',
            data: {url_field: inputField, user_field: optionField},
            success: function (data) {
                endSubmitting(true)
                ci_table = data["code-improvements"];
                css_table = data["css-tags-improvements"];
                semantics_table = data["semantic-suggestions"]
                persona_table = data["persona_suggestions"]
                score = data["score"]
                domain = data["domain"];
                generateHTMLTable(ci_table);
                generateSemanticsTable(semantics_table);
                generateCSSTagsTable(css_table, domain)
                generatePersonaTable(persona_table)

            },
            statusCode: {
                500: function (data) {
                    endSubmitting(false)
                    alert(data.responseJSON.detail);
                },
                400: function (data) {
                    endSubmitting(false)
                    alert(data.responseJSON.detail);
                }
            }
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
        tableHTML += '<tr><td><div class="ci-description">' + row[1] + '</div><div class="ci-suggestion">' + row[2] + '</div></td><td class="ci-count">' + row[0] + '</td></tr>';
    }

    tableHTML += '</table>';

    $('#code-improvements table').replaceWith(tableHTML);
}

function generateSemanticsTable(semantics_table) {
    let tableHTML = '<h3>No improvements for used tags<h3/>';

    if(semantics_table.length > 0){
        tableHTML = '<table>';

        for (var i = 0; i < semantics_table.length; i++) {
            var row = semantics_table[i];
            tableHTML += '<tr><td><div class="semantics-error">' + row[0] + '</div></td><td class="semantics-suggestion">' + row[1] + '</td></tr>';
        }

        tableHTML += '</table>';
    }

    $('#semantic-suggestions table').replaceWith(tableHTML);
}

function generatePersonaTable(persona_table){
    let tableHTML = '<h3>No improvements for persona<h3/>';

    if(persona_table.length > 0){
        tableHTML = '<table>';

        for (var i = 0; i < persona_table.length; i++) {
            var row = persona_table[i];
            tableHTML += '<tr><td><div class="persona-error">' + row[0] + '</div></td><td class="persona-suggestion">' + row[1] + '</td></tr>';
        }

        tableHTML += '</table>';
    }

    $('#persona-suggestions table').replaceWith(tableHTML);
}

function generateCSSTagsTable(css_table, domain) {
    const availableSinceThreshold = 50
    const partiallySupportedThreshold = 100
    let tableHTML = '<h3>No improvements for used tags<h3/>';
    // console.log(typeof(css_table))
    // console.log(css_table)
    // console.log(domain)
    let domainTags = css_table[domain]

    if (domainTags.length > 0) {
        tableHTML = '<table>';

        for (let i = 0; i < domainTags.length; i++) {
            const row = domainTags[i];
            const css_tag = Object.keys(row)[0]
            const browsersObj = row[css_tag]
            const browserObjKeys = Object.keys(browsersObj)
            const partiallySupported = {}
            const supportedSince = {}

            browserObjKeys.forEach(key => {
                if (browsersObj[key].hasOwnProperty('a') && browsersObj[key]['a'] > partiallySupportedThreshold) {
                    if (partiallySupported[css_tag] === undefined) {
                        partiallySupported[css_tag] = [key]
                    } else {
                        partiallySupported[css_tag].push(key)
                    }
                }
                if (browsersObj[key].hasOwnProperty('y') && browsersObj[key]['y'] < availableSinceThreshold) {
                    if (supportedSince[css_tag] === undefined) {
                        supportedSince[css_tag] = [key]
                    } else {
                        supportedSince[css_tag].push(key)
                    }
                }
            })

            Object.keys(partiallySupported).forEach(key => {
                tableHTML += '<tr><td><div class="ci-description">' + key + '</div><div class="ci-suggestion">' + 'This tag is partially supported' + '</div></td><td class="ci-count">' + partiallySupported[key].join(' ') + '</td></tr>';
            })

            Object.keys(supportedSince).forEach(key => {
                tableHTML += '<tr><td><div class="ci-description">' + key + '</div><div class="ci-suggestion">' + 'This tag is supported in late versions' + '</div></td><td class="ci-count">' + supportedSince[key].join(' ') + '</td></tr>';
            })
        }

        tableHTML += '</table>';
    }

    $('#css-tags-improvements table').replaceWith(tableHTML);
}
