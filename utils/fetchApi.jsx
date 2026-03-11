const postApi = async (endpoint, obj) =>{
    const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(obj)
    });
    const data = await res.json();
    return { res: res, data: data };
}

export default postApi;