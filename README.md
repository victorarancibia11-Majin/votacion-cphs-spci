# Votación CPHS SPCI (Netlify)

Votación abierta: cualquier persona con el enlace puede votar, sin cuenta ni código.
Se elige 1 representante por turno (A y B).

## Cómo funciona

- **`/`**: la persona elige su turno, marca un candidato y confirma.
- **`/admin.html`**: la comisión entra con la clave (`ADMIN_KEY`), ve la participación y los resultados, y abre, cierra o reinicia cada turno.
- Se permite **un voto por dispositivo** mediante una cookie. No se guarda nombre, IP ni hora junto al voto.
- Límite: alguien que borre las cookies o use otro teléfono o una ventana privada puede votar de nuevo. Compara el total de votos con las personas de cada turno (11 en A, 19 en B) antes de oficializar.

## Publicar (sitio ya creado: votacion-cphs-spci)

En una terminal, dentro de esta carpeta:

```
npm install
npx netlify-cli login
npx netlify-cli deploy --prod --site ace1df24-f24e-4355-9755-05fb6e26ccc1
```

El sitio queda en https://votacion-cphs-spci.netlify.app
y el panel en https://votacion-cphs-spci.netlify.app/admin.html

La variable `ADMIN_KEY` ya está configurada en el sitio. Puedes cambiarla en
Netlify → Project configuration → Environment variables (y volver a desplegar).

## Estructura

```
netlify.toml
package.json                     Dependencia: @netlify/blobs
public/index.html                Página de votación
public/admin.html                Panel de la comisión
public/estilos.css
netlify/lib/datos.mjs            Candidatos por turno  <- edita aquí
netlify/lib/almacen.mjs          Acceso a Netlify Blobs
netlify/functions/papeleta.mjs   GET  /api/papeleta
netlify/functions/votar.mjs      POST /api/votar
netlify/functions/admin.mjs      POST /api/admin (protegido con ADMIN_KEY)
```

## Día de la votación

1. Haz un voto de prueba y luego **Reiniciar turno** en el panel.
2. Comparte el enlace por WhatsApp o correo.
3. Sigue la participación con **Actualizar**.
4. Al terminar, **Cerrar votación** en cada turno y registra el resultado en el acta.
