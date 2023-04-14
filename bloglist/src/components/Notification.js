const Notification = ({ notification }) => {
    console.log(notification)

    const successStyle = {
        border: "5px solid green",
        borderRadius: 5,
        background: "white",
        width: "100%",
        padding: "10px",
        fontSize: 20,
        color: "green"
    }

    const failureStyle = {
        border: "5px solid red",
        borderRadius: 5,
        background: "white",
        width: "100%",
        padding: "10px",
        fontSize: 20,
        color: "red"
    }

    return (
        <div style={notification.type === "success"
            ? successStyle
            : failureStyle}>
            {notification.message}
        </div>
    )
}

export default Notification