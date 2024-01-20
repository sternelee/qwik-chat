import {
  component$,
  useSignal,
  $,
  useContext,
  useTask$,
} from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { PileContext } from "~/pile";
import DeletePile from "./DeletePile"; // TODO: 未完成
import styles from "./index.module.scss";

const quotes = [
  "One moment at a time",
  "Scribe your soul",
  "Reflections reimagined",
  "Look back, leap forward!",
  "Tales of you - for every human is an epic in progress",
  "Your thoughtopia awaits",
  "The quintessence of quiet contemplation",
  "Journal jamboree",
];

export default component$(() => {
  const navigator = useNavigate();
  const store = useContext(PileContext);
  const quote = useSignal(quotes[0]);

  useTask$(() => {
    quote.value = quotes[Math.floor(Math.random() * quotes.length)];
  });

  return (
    <div class={styles.frame}>
      {/* <div class={styles.bg}></div> */}
      <div class={styles.wrapper}>
        <div class={styles.header}>
          <div class={styles.holder}>
            <Logo class={styles.icon} />
          </div>

          {/* <div class={styles.name}>Pile</div>
          <div class={styles.version}>{quote}</div> */}
        </div>

        <a
          href="/new-pile"
          class={styles.create}
          onClick$={() => navigator("/new-pile")}
        >
          Create a new pile →
        </a>

        <div class={styles.or}>or open an existing pile</div>

        <div class={styles.piles}>
          {store.piles.map((pile) => (
            <div class={styles.pile} key={pile.path}>
              <div class={styles.left}>
                <div class={styles.name}>{pile.name}</div>
                <div class={styles.src}>{pile.path}</div>
              </div>
              <div class={styles.right}>
                <DeletePile pile={pile} />
                <a
                  href={`/pile/${pile.name}`}
                  class={styles.button}
                  onClick$={() => navigator(`/pile/${pile.name}`)}
                >
                  Open
                </a>
              </div>
            </div>
          ))}
        </div>

        <div class={styles.footer}>
          <a href="https://udara.io/pile" target="_blank">
            <div class={styles.unms}></div>
            {quote} – <b>Pile</b>
          </a>

          <div class={styles.nav}>
            <a href="/license" class={styles.link}>
              License
            </a>
            <a
              href="https://x.com/TGUPJ/status/1712868302312051112"
              target="_blank"
              class={styles.link}
            >
              Tutorial
            </a>
            <a
              href="https://github.com/udarajay/pile"
              target="_blank"
              class={styles.link}
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

const Logo = component$((props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="114"
      height="119"
      viewBox="0 0 114 119"
      fill="none"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M0.0012207 67.5781L21.6456 80.0744V105.069L0.0012207 92.5724V67.5781Z"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M90.912 66.7449L69.2676 79.2411V104.235L90.912 91.7392V66.7449Z"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M114 53.4143L92.3555 65.912V90.9063L114 78.4086V53.4143Z"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M23 79.2533L44.6444 66.7556L66.29 79.2533L44.6444 91.7495L23 79.2533Z"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M23 80.9199L44.6444 93.4162V118.41L23 105.914V80.9199Z"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M67.7325 80.0867L46.0881 92.5829V117.577L67.7325 105.081V80.0867Z"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M23.0903 25.8254L44.7347 13.3291L66.3804 25.8254L44.7347 38.323L23.0903 25.8254Z"
        fill="currentColor"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M0.0012207 39.1559L21.6456 26.6582L43.2913 39.1559L21.6456 51.6521L0.0012207 39.1559Z"
        fill="currentColor"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M46.1794 39.1559L67.8238 26.6582L89.4695 39.1559L67.8238 51.6521L46.1794 39.1559Z"
        fill="currentColor"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M46.1794 12.4963L67.8238 0L89.4695 12.4963L67.8238 24.9939L46.1794 12.4963Z"
        fill="currentColor"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M69.2676 25.8254L90.912 13.3291L112.558 25.8254L90.912 38.323L69.2676 25.8254Z"
        fill="currentColor"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M0.0012207 40.8225L21.6456 53.3188V78.3131L0.0012207 65.8168V40.8225Z"
        fill="currentColor"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M46.1794 40.8225L67.8238 53.3188V78.3131L46.1794 65.8168V40.8225Z"
        fill="currentColor"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M90.912 39.9893L69.2676 52.4855V77.4798L90.912 64.9836V39.9893Z"
        fill="currentColor"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M44.7347 39.9893L23.0903 52.4855V77.4798L44.7347 64.9836V39.9893Z"
        fill="currentColor"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M114 26.6587L92.3555 39.1564V64.1507L114 51.653V26.6587Z"
        fill="currentColor"
      />
    </svg>
  );
});
