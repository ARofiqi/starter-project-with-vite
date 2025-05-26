export default class AboutPage {
  async render() {
    return `
          <section class="about-container">
            <h1 class="about-title">👨‍💻 Tentang Saya</h1>
            <div class="about-card">
              <p><strong>Nama:</strong> Ahmad Rofiqi</p>
              <p><strong>Cohort:</strong> FC-01</p>
              <p><strong>Learning Path:</strong> Frontend & Backend</p>
              <p><strong>Deskripsi:</strong> Seorang yang akan menjadi <span class="highlight">Fullstack Developer</span> 🔥</p>
            </div>
          </section>
        `;
  }

  async afterRender() {
    // Optional: logika tambahan setelah render
  }
}
