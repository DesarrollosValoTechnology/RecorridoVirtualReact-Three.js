// src/data/avisoPrivacidad.ts
//
// Texto oficial del aviso de privacidad simplificado, entregado por el área jurídica en
// agosto 2026 (fuente: `Aviso de Privacidad - Zibatá.pdf`; ver
// `Claude Admin/aviso-privacidad-zibata.md` para el detalle completo).
//
// Va como TEXTO dentro de la app y no como enlace a PDF: el kiosco del showroom funciona sin
// internet, y un enlace a un archivo externo simplemente no abre ahí. El aviso INTEGRAL sí vive
// fuera (https://zibata.com/) y sí se enlaza, porque ese sí es correcto que viva fuera.
//
// 🔴 Si algún día jurídico entrega una versión nueva: se cambia el texto de aquí Y el valor de
// VERSION_AVISO_PRIVACIDAD, nunca uno sin el otro — es lo que permite demostrar qué firmó cada
// persona.

export const VERSION_AVISO_PRIVACIDAD = '2023-09-18';

export const URL_AVISO_INTEGRAL = 'https://zibata.com/';

export const TEXTO_AVISO_PRIVACIDAD = `Con fundamento en los artículos 15 y 16 de la Ley Federal de Protección de Datos Personales en Posesión de Particulares ("la Ley"), hacemos de su conocimiento que Operadora Zibatá, S. de R.L. de C.V., con domicilio en calle Mezquite, número 1, Fraccionamiento Zibatá, código postal 76269, El Marqués, Querétaro es la responsable de recabar sus datos personales, el uso que se les dé a los mismos y de su protección.

Sus datos personales serán protegidos bajo los principios señalados en la Ley.

Su información personal será utilizada para dar respuesta a la solicitud de información a través del formulario, así como para las siguientes finalidades: proveer los servicios y productos que ha solicitado; notificarle sobre nuevos servicios o productos que tengan relación con los ya contratados o adquiridos; comunicarle sobre cambios en los mismos; elaborar estudios y programas que son necesarios para determinar hábitos de consumo; realizar evaluaciones periódicas de nuestros productos y servicios a efecto de mejorar la calidad de los mismos; evaluar la calidad del servicio que brindamos.

¿Qué datos personales utilizaremos para estos fines?

Para llevar a cabo las finalidades descritas en el presente aviso de privacidad, recabaremos, utilizaremos y resguardaremos los siguientes datos personales: Nombre, Edad, Estado civil, Sexo, Dirección, Teléfono fijo, Teléfono celular, Correo electrónico, Registro Federal de Contribuyentes, Clave Única de Registro de Población, Ingresos.

Sus datos personales podrán ser transferidos a entidades del mismo grupo de interés de la empresa, nacionales o extranjeras.

En caso de que no obtengamos su oposición expresa para que sus datos personales sean transferidos de forma y términos antes descritos, entenderemos que ha otorgado su consentimiento en forma tácita para ello.

Si desea conocer nuestro aviso de privacidad integral, lo podrá consultar en el sitio web ${URL_AVISO_INTEGRAL}

Última actualización de este aviso de privacidad: 18/09/2023`;
