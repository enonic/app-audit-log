document.addEventListener("DOMContentLoaded", () => {
    const uploadInput = document.getElementById("upload");

    uploadInput.addEventListener("change", () => {
        const formData = new FormData();
        formData.append("license", uploadInput.files[0]);
        const errorSpan = document.getElementById('invalid-license-message');
        if (errorSpan) {
            delete errorSpan.style.display;
        }

        fetch(CONFIG.licenseUrl, {
            body: formData,
            "Content-type": "multipart/form-data",
            method: "POST",
        })
        .then(response => response.json())
        .then(data => {
            if (data.licenseValid) {
                location.reload();
            } else if (errorSpan) {
                errorSpan.style.display = 'block';
            }
        });
    });
});
