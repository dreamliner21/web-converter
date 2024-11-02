async function convertCode() {
    const codeInput = document.getElementById("codeInput").value;
    const conversionType = document.getElementById("conversionType").value;

    try {
        const response = await fetch("/convert", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                code: codeInput,
                type: conversionType,
            }),
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            // Tampilkan pesan error dengan SweetAlert2
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                confirmButtonText: 'OK'
            });
            return;
        }

        const result = await response.text();
        document.getElementById("result").textContent = result;
    } catch (error) {
        // Tampilkan error jika terjadi masalah koneksi
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Terjadi kesalahan, coba lagi nanti!',
            confirmButtonText: 'OK'
        });
    }
}