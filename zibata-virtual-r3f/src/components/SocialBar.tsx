// src/components/SocialBar.tsx
import { useTourStore } from '../store/useTourStore';
import { diccionario } from '../data/diccionario';

export default function SocialBar() {
    // 🚨 El Hook y el atajo "t" deben ir ADENTRO del componente para que reaccionen a los cambios
    const idiomaActual = useTourStore(state => state.idiomaActual);
    const t = diccionario[idiomaActual];

    return (
        <div className="ui-bottom-left">
            <span className="texto-follow">{t["UI_SIGUENOS"]}</span>
            <div className="social-icons-row">
                <a href="https://facebook.com/zibata.mx" target="_blank" rel="noreferrer" className="btn-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="https://instagram.com/zibata.mx" target="_blank" rel="noreferrer" className="btn-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="https://youtube.com/@zibataoficial" target="_blank" rel="noreferrer" className="btn-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22.5 7v10a4 4 0 0 1-4 4h-13a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h13a4 4 0 0 1 4 4Z"></path><path d="M9.7 15.6 15.6 12 9.7 8.4Z"></path></svg>
                </a>
                <a href="https://tiktok.com/@zibata.mx" target="_blank" rel="noreferrer" className="btn-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 12a4 4 0 1 0 4 4V2a5 5 0 0 0 5 5"></path></svg>
                </a>
            </div>
        </div>
    );
}