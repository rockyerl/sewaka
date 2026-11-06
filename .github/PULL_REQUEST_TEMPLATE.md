name: Pull Request
about: Create a pull request for review
title: ""
labels: []
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        Terima kasih atas kontribusi Anda! 🙏
        Pastikan PR ini mengikuti panduan di bawah.

  - type: textarea
    id: description
    attributes:
      label: Deskripsi
      description: Jelaskan apa yang diubah dan mengapa.
      placeholder: |
        - Masalah yang diperbaiki:
        - Solusi yang diterapkan:
        - Perubahan yang dibuat:
    validations:
      required: true

  - type: dropdown
    id: type
    attributes:
      label: Tipe Perubahan
      options:
        - Fitur baru
        - Bug fix
        - Refactoring
        - Dokumentasi
        - Testing
        - Performance
        - Security
        - Lainnya
    validations:
      required: true

  - type: textarea
    id: testing
    attributes:
      label: Testing
      description: Jelaskan bagaimana Anda menguji perubahan ini.
      placeholder: |
        - [ ] Build berhasil (`npm run build`)
        - [ ] Lint tidak ada error (`npm run lint`)
        - [ ] Type check tidak ada error (`npm run typecheck`)
        - [ ] Unit tests pass (`npm test`)
        - [ ] E2E tests pass (`npx playwright test`)
        - [ ] Manual testing di browser
    validations:
      required: true

  - type: textarea
    id: screenshots
    attributes:
      label: Screenshots (jika ada perubahan UI)
      description: Tambahkan screenshot atau video untuk perubahan UI.
      placeholder: "Drag and drop images here..."

  - type: checkboxes
    id: checklist
    attributes:
      label: Checklist
      options:
        - label: Kode saya mengikuti style guide project
          required: true
        - label: Saya sudah menambahkan tests untuk perubahan saya
          required: false
        - label: Saya sudah mengupdate dokumentasi
          required: false
        - label: Tidak ada secret atau API key di kode
          required: true
        - label: Perubahan saya tidak breaking existing features
          required: true

  - type: textarea
    id: related
    attributes:
      label: Related Issues
      description: Link ke issue yang terkait dengan PR ini.
      placeholder: "Fixes #123"
