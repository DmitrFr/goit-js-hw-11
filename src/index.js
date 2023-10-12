import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

Notify.init({
  position: 'right-bottom',
  distance: '50px',
  timeout: 3000,
  cssAnimationStyle: 'zoom',
  fontFamily: 'Arial, sans-serif',
});

const formEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const loadButton = document.querySelector('.load-more');

const BASIC_URL = 'pixabay.com/api';
const PIX_KEY = 'key=40006992-08c292983e9297ae8167e7fdc';
const IMAGE_TYPE = 'image_type=photo';
const ORIENTATION = 'orientation=horizontal';
const SAFE_SEARCH = 'safesearch=true';
const PER_PAGE = 'per_page=40';

let imgQuantity = 0;
let pageIndex = 1;
let value = '';
let p = '';
const lightBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

loadButton.classList.add('is-hidden');

formEl.addEventListener('submit', onFormSubmit);

async function onFormSubmit(event) {
  event.preventDefault();
  loadButton.classList.add('is-hidden');
  const entered_value = this.elements.searchQuery.value;
  const axiosGet = await axios
    .get(
      `https://${BASIC_URL}/?${PIX_KEY}&q=${entered_value}&${IMAGE_TYPE}&${ORIENTATION}&${SAFE_SEARCH}&${PER_PAGE}&page=${pageIndex}`
    )
    .then(response => {
      console.log(response);
      console.log(response.data.hits);
      console.log(response.data.totalHits);
      if (response.data.hits.length === 0 || entered_value === '') {
        imgQuantity = 0;
        clearCards();
        Notify.warning(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }
      clearCards();
      drawCards(response.data.hits);
      imgQuantity += 40;
      loadButton.classList.remove('is-hidden');
      console.log(value);
      if (value !== entered_value) {
        Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
        value = this.elements.searchQuery.value;
      }
    });
  lightBox.refresh();
  return axiosGet;
}

function clearCards() {
  galleryEl.innerHTML = '';
}

function drawCards(res) {
  const markup = res
    .map(
      user =>
        `<div class="photo-card">
  <a class="gallery__link" href="${user.largeImageURL}">
    <img class="gallery__image" src="${user.webformatURL}" alt="${user.tags}" loading="lazy" />
  </a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      <span>${user.likes}</span>
    </p>
    <p class="info-item">
      <b>Views</b>
      <span>${user.views}</span>
    </p>
    <p class="info-item">
      <b>Comments</b>
      <span>${user.comments}</span>
    </p>
    <p class="info-item">
      <b>Downloads</b>
      <span>${user.downloads}</span>
    </p>
  </div>
</div>`
    )
    .join('');
  galleryEl.insertAdjacentHTML('beforeend', markup);
  loadButton.classList.remove('is-hidden');
}

loadButton.addEventListener('click', onLoadButtonClick);

async function onLoadButtonClick() {
  const entered_value = formEl.elements.searchQuery.value;
  pageIndex += 1;
  if (imgQuantity >= 500) {
    Notify.warning(
      `We're sorry, but you've reached the end of search results.`
    );
    return;
  }
  const axiosGet = await axios
    .get(
      `https://${BASIC_URL}/?${PIX_KEY}&q=${entered_value}&${IMAGE_TYPE}&${ORIENTATION}&${SAFE_SEARCH}&${PER_PAGE}&page=${pageIndex}`
    )
    .then(response => {
      console.log(response);
      console.log(response.data.hits);
      if (response.data.hits.length === 0 || entered_value === '') {
        Notify.warning(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }
      drawCards(response.data.hits);
      imgQuantity += 40;
      console.log(imgQuantity);
    });
  lightBox.refresh();
  return axiosGet;
}
