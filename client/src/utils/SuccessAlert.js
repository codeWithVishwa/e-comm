import Swal from 'sweetalert2';


const successAlert = (title) => {
    const alert=Swal.fire({
        icon: "success",
        title: title,
        background:"#616161",
        color:"#ffff",
        confirmButtonColor:"#3F00FF",
        iconColor:"#00FF00"


    });
    return alert
}

export default successAlert