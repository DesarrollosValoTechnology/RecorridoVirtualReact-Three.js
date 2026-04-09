// src/components/FormularioContacto.tsx
import { useState } from 'react';
import { useTourStore } from '../store/useTourStore';
import { diccionario } from '../data/diccionario';

export default function FormularioContacto() {
    const idiomaActual = useTourStore(state => state.idiomaActual);
    const t = diccionario[idiomaActual]; // Atajo mágico para las traducciones

    const [formData, setFormData] = useState({
        nombre: '', interes: '', correo: '', telefono: '', contacto: ''
    });
    const [enviado, setEnviado] = useState(false);

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        console.log("Datos listos para enviar:", formData);
        setEnviado(true);
        setTimeout(() => setEnviado(false), 3000);
        setFormData({ nombre: '', interes: '', correo: '', telefono: '', contacto: '' });
    };

    const inputStyle = {
        width: '100%', padding: '12px', borderRadius: '6px', 
        border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', 
        color: 'white', outline: 'none', marginBottom: '15px', 
        fontSize: '14px', boxSizing: 'border-box' as const
    };

    const labelStyle = { display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '14px' };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '20px', textAlign: 'left' }}>
            
            <label style={labelStyle}>{t["UI_FORM_NOMBRE"]}</label>
            <input 
                type="text" name="nombre" value={formData.nombre} onChange={handleChange} required
                placeholder={t["UI_FORM_NOMBRE"]} style={inputStyle} 
            />

            <label style={labelStyle}>{t["UI_FORM_INTERES"]}</label>
            <select name="interes" value={formData.interes} onChange={handleChange} required style={inputStyle}>
                <option value="" disabled>{t["UI_FORM_SELECCIONE"]}</option>
                <option value="unilotes" style={{ color: 'black' }}>Unilotes</option>
                <option value="macrolotes" style={{ color: 'black' }}>Macrolotes</option>
                <option value="minimacrolotes" style={{ color: 'black' }}>Minimacrolotes</option>
            </select>

            <label style={labelStyle}>{t["UI_FORM_CORREO"]}</label>
            <input 
                type="email" name="correo" value={formData.correo} onChange={handleChange} required
                placeholder={t["UI_FORM_CORREO"]} style={inputStyle} 
            />

            <label style={labelStyle}>{t["UI_FORM_TELEFONO"]}</label>
            <input 
                type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required
                placeholder={t["UI_FORM_TELEFONO"]} style={inputStyle} 
            />

            <label style={labelStyle}>{t["UI_FORM_COMO"]}</label>
            <select name="contacto" value={formData.contacto} onChange={handleChange} required style={inputStyle}>
                <option value="" disabled>{t["UI_FORM_SELECCIONE"]}</option>
                <option value="llamada" style={{ color: 'black' }}>{t["UI_FORM_LLAMADA"]}</option>
                <option value="correo" style={{ color: 'black' }}>{t["UI_FORM_CORREO"]}</option>
                <option value="whatsapp" style={{ color: 'black' }}>WhatsApp</option>
            </select>

            <button 
                type="submit" 
                style={{ 
                    width: '100%', background: enviado ? '#555' : 'var(--zibata-verde, #00ff88)', 
                    color: enviado ? 'white' : 'black', border: 'none', padding: '12px', 
                    borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', 
                    transition: 'background 0.3s', marginTop: '10px'
                }}
            >
                {enviado ? t["UI_FORM_ENVIADO"] : t["UI_FORM_ENVIAR"]}
            </button>
        </form>
    );
}