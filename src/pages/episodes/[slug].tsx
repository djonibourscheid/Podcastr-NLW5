import { GetStaticPaths, GetStaticProps } from 'next';

import { usePlayer } from '../../contexts/PlayerContext';

import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { api } from '../../services/api';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

import styles from './episode.module.scss';

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
  description: string;
}

type EpisodeProps = {
  episode: Episode;
}


export default function Episode({ episode }: EpisodeProps) {
  const { play } = usePlayer();


  return (
    <div className={styles.episode}>
      <Head>
        <title>{episode.title} | Podcastr</title>
      </Head>


      <div className={styles.thumbnailContainer}>
        <Link href="/">
          <button type="button" title="Voltar para a home">
            <img src="/arrow-left.svg" alt="Voltar" />
          </button>
        </Link>

        <Image
          width={620}
          height={320}
          src={episode.thumbnail}
          alt={episode.title}
          objectFit="cover"
        />

        <button type="button" onClick={() => play(episode)} title="Tocar episódio">
          <img src="/play.svg" alt="Tocar episódio" />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: episode.description }}
      />
    </div>
  )
}


export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}
// no 'paths' podemos definir páginas para que o next já faça o ssg do que foi passado
// fallback: false - retorna 404 se tentarmos acessar uma página que não foi passada no 'paths'
// fallback: true - o que foi passado no 'paths' fica como ssg e o que ainda não foi ele gera na hora do acesso (roda no client)
// fallback: 'blocking' - só redireciona para a página quando os dados já estiverem carregados (roda no backend do next) melhor para SEO

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { slug } = ctx.params;

  const { data } = await api.get(`/episodes/${slug}`);

  const episode = {
    id: data.id,
    title: data.title,
    members: data.members,
    thumbnail: data.thumbnail,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url,
  };

  return {
    props: {
      episode,
    },
    revalidate: 60 * 60 * 24,
  }
}