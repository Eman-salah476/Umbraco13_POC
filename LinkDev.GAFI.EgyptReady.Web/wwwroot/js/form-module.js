class FormService {
    constructor(url) {
        this.url = url;
    }

    fetchForm(formId, formioId, readOnly, onSubmitSuccess) {
        $.get(`${this.url}/form/${formId}`, (result) => {
            this.createForm(result, formId, formioId, readOnly, onSubmitSuccess);
        });
    }

    createForm(formJsonData, formId, formioId, readOnly, onSubmitSuccess) {
        let postUrl = `${this.url}/query/${formId}/submit`;

        Formio.createForm(document.getElementById(`${formioId}`), formJsonData, {
            readOnly: readOnly,
        }).then(async (form) => {

            // oad pre-filled data if provided
            const submissionData = await this.loadDraft(formId);

            if (submissionData) {
                form.submission = {
                    data: submissionData.data
                };
            }

            form.on('submit', (submission) => {
                console.log(submission);
                submission.data.formId = formId;
                const submissionForm = {
                    data: submission.data,
                    state: "complete"
                };

                // Emit custom events
                if (form.eventListeners && form.eventListeners['fireNextEvent']) {
                    form.emit('fireNextEvent', submission);
                }

                if (form.eventListeners && form.eventListeners['firePreviousEvent']) {
                    form.emit('firePreviousEvent', submission);
                }

                $.ajax({
                    url: postUrl,
                    type: 'POST',
                    data: JSON.stringify(submissionForm),
                    contentType: 'application/json',
                    success: onSubmitSuccess
                });
            });

            // Listen for the "Next" custom event
            form.on('fireNextEvent', (data) => {
                if (form.checkValidity()) {
                    this.getRedirectForm(formId, data)
                        .done((response) => {
                            const nextFormId = response.Next;
                            this.fetchForm(nextFormId, formioId, readOnly, onSubmitSuccess);
                        })
                        .fail((error) => {
                            console.error("Error:", error);
                        });
                }
            });

            // Listen for the "Previous"
            form.on('firePreviousEvent', (data) => {
                if (form.checkValidity()) {
                    this.getRedirectForm(formId, data)
                        .done((response) => {
                            const previousFormId = response.Previous;
                            this.fetchForm(previousFormId, formioId, readOnly, onSubmitSuccess);
                        })
                        .fail((error) => {
                            console.error("Error:", error);
                        });
                }
            });
        });
    }

    getRedirectForm(formId, data) {
        const url = `${this.url}/Form/${formId}/SaveDraft`;

        const submissionObject = {
            data: data,
            state: "complete"
        };

        return $.ajax({
            url: url,
            type: 'POST',
            data: JSON.stringify(submissionObject),
            contentType: 'application/json'
        })
    }

    loadDraft(formId) {
        const url = `${this.url}/Form/${formId}/GetDraft`;

        return $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json'
        });
    }

}