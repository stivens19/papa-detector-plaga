import React, { useCallback, useRef, useState } from 'react';
import Webcam from "react-webcam";

const PapaApp = () => {
    const webcamRef = useRef({});
    const [state, setstate] = useState({})
    const [loading, setLoading] = useState(false)
    const [camara, setCamara] = useState(true);
    const videoConstraints = {
        facingMode: camara ? 'user' : { exact: "environment" }
    };
    const capture = useCallback(
        async () => {
            setLoading(true);
            const imageSrc = webcamRef.current.getScreenshot();
            const res = await guardar(imageSrc)
            setstate(res)
        },
        [webcamRef]
    );
    const handlePictureClick = () => {
        document.querySelector('#fileselector').click();
        setLoading(true);
    }
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const cloudUrl = 'https://api.cloudinary.com/v1_1/dmbdaswcx/upload';

            const formData = new FormData();
            formData.append('upload_preset', 'react-journal')
            formData.append('file', file);

            try {
                const resp = await fetch(cloudUrl, {
                    method: 'POST',
                    body: formData
                })
                if (resp.ok) {
                    const cloudResp = await resp.json();
                    const res = await fetch('https://papa-detector.herokuapp.com/predecir', {
                        method: "POST",
                        body: JSON.stringify({
                            url: cloudResp.secure_url
                        }),
                        headers: {
                            "Content-Type": "application/json"
                        }
                    })
                    const result2 = await res.json()
                    setLoading(false)
                    setstate({
                        url: cloudResp.secure_url,
                        enfermedad: result2.diagnostico
                    })
                } else {
                    throw await resp.json();
                }
            } catch (error) {
                console.log(error)
            }
        }
    }
    const guardar = async (imagen) => {

        const cloudUrl = 'https://api.cloudinary.com/v1_1/dmbdaswcx/upload';
        const formData = new FormData();
        formData.append('upload_preset', 'react-journal')
        formData.append('file', imagen);
        const peticion = await fetch(cloudUrl, {
            method: 'POST',
            body: formData
        })
        const pres = await peticion.json();
        const res = await fetch('https://papa-detector.herokuapp.com/predecir', {
            method: "POST",
            body: JSON.stringify({
                url: pres.secure_url
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const result2 = await res.json()
        setLoading(false)
        return {
            url: pres.secure_url,
            enfermedad: result2.diagnostico
        }

    }
    return (
        <>
            <header className="p-2 text-center">
                <h3 className="text-light">Deteccion de plaga en papa</h3>
            </header>
            <div className="container">
                <div className="row">
                    <div className="col-sm-12 col-md-8">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                        />
                    </div>

                    <div className="col-sm-12 col-md-4">
                        <div className="d-flex justify-content-between linebotom">
                            <button className="btn btn-primary" onClick={capture}>Tomar Foto</button>
                            <button className="btn btn-warning" onClick={() => {
                                setCamara(!camara)
                            }}>Cambiar cámara</button>
                            <input id="fileselector" type="file" style={{ display: 'none' }} onChange={handleFileChange} />

                            <button className="btn btn-success" onClick={handlePictureClick}>
                                Imagen
                            </button>
                        </div>

                        <div className="image-contain mt-4 linebotom">
                            {loading && <div className="loading"></div>}
                            {(state.url && !loading) && <img src={state.url} alt={state.enfermedad} className="w-100" />}

                            {(state.url && !loading) && <p><b>Diagnóstico</b>: {state.enfermedad}</p>}

                            {(state.url && !loading) && <div className="alert alert-danger text-center" role="alert">
                                <b>Advertencia: </b>El diagnostico puede fallar
                            </div>}
                        </div>
                    </div>
                </div>
            </div>


        </>
    );
}

export default PapaApp;
