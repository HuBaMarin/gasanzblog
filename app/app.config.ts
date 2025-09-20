export default defineAppConfig({
  site: {
    name: 'Parroquia Santa Cruz Murialdo',
    url: 'https://murialdo.blog',
    nav: [
      { label: 'Inicio', to: '/' },
      { label: 'Actividades', to: '/actividades' },
      { label: 'Eventos', to: '/eventos' }
    ],
    social: {
      instagram: 'https://www.instagram.com/parroquia_stacruz_murialdo/'
    },
    author: {
      name: 'Parroquia Santa Cruz Murialdo',
      bio: 'Comunidad parroquial, formación y acompañamiento inspirados por San Leonardo Murialdo.',
      social: {
        instagram: 'https://www.instagram.com/parroquia_stacruz_murialdo/'
      }
    }
  }
})
