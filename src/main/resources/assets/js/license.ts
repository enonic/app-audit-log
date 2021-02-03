
// eslint-disable-next-line @typescript-eslint/naming-convention
interface Window { CONFIG: any }

document.addEventListener('DOMContentLoaded', () => {
    const uploadInput = document.getElementById('upload') as HTMLInputElement;

    uploadInput.addEventListener('change', () => {
        const formData = new FormData();
        formData.append('license', uploadInput.files[0]);

        fetch(window.CONFIG.licenseUrl, {
            body: formData,
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-type': 'multipart/form-data',
            },
            method: 'POST',
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);

                if (data.licenseValid) {
                    location.reload();
                }
            });
    });
});
