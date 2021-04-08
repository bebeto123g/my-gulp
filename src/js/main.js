// $('.page__header').on('click', function () {
//   $(this).toggleClass('active')
//   // $(this).toggleClass('puppa')
// })

const header = document.querySelector('.page__header')
header.addEventListener('click', function (e) {
  console.log(e.currentTarget)

  this.classList.toggle('active')
})
