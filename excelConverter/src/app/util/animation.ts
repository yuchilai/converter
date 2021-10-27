import {
  trigger,
  transition,
  state,
  style,
  animate,
  AUTO_STYLE
} from "@angular/animations";

const COLLAPSE_DEFAULT_DURATION = 300;
const FADE_DEFAULT_DURATION = 500;
const ROTATE_DEFAULT_DURATION = 300;

export let fade = trigger('fade', [
  state('void', style({ opacity: 0 })),
  transition(':enter, :leave', [
    animate(FADE_DEFAULT_DURATION)
  ])
]);

export let collapse = trigger('collapse', [
  state('false', style({ height: AUTO_STYLE, visibility: AUTO_STYLE })),
  state('true', style({ height: '0', visibility: 'hidden' })),
  transition('false => true', animate(COLLAPSE_DEFAULT_DURATION + 'ms ease-in')),
  transition('true => false', animate(COLLAPSE_DEFAULT_DURATION + 'ms ease-out'))
]);

export let rightRotate = trigger('rightRotate', [
  state('true', style({ transform: AUTO_STYLE })),
  state('false', style({ transform: 'rotate(-180deg)' })),
  transition('false => true', animate(ROTATE_DEFAULT_DURATION + 'ms')),
  transition('true => false', animate(ROTATE_DEFAULT_DURATION + 'ms'))
]);

export let leftRotate = trigger('leftRotate', [
  state('true', style({ transform: AUTO_STYLE })),
  state('false', style({ transform: 'rotate(180deg)' })),
  transition('false => true', animate(ROTATE_DEFAULT_DURATION + 'ms')),
  transition('true => false', animate(ROTATE_DEFAULT_DURATION + 'ms'))
]);

