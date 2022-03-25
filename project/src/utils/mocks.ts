import {system, name, internet} from 'faker'; // Пакет генерации моковых данных (можно и без него)
import {GameType} from '../const';
import {QuestionArtist} from '../types/question';

export const makeFakeArtistQuestion = (): QuestionArtist => ({
  type: GameType.Artist,
  song: {
    artist: name.title(),
    src: system.filePath(),
  },
  answers: new Array(3).fill(null).map(() => (
    { picture: internet.avatar(), artist: name.title() }
  )),
} as QuestionArtist);
