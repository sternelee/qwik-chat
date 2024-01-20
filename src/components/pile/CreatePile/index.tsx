import { component$, useSignal, $, useContext } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import styles from "./index.module.scss";
import { PileContext } from "~/pile";
import { createPilePath } from "~/utils";

export default component$(() => {
  const navigator = useNavigate();
  const name = useSignal("");
  const path = useSignal("");

  const store = useContext(PileContext);

  const handleClick = $(() => {
    console.log("选择目录");
  });
  const handleSubmit = $(() => {
    if (!name.value || !path.value) return;
    const newPilePath = createPilePath(path.value);
    store.piles.push({
      name: name.value,
      path: newPilePath,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    navigator("/pile/" + name.value);
  });

  return (
    <div class={styles.frame}>
      <div class={styles.card}>
        <div class={styles.header}>
          <div class={styles.name}>Create a new pile</div>
        </div>

        <div class={styles.form}>
          <div class={styles.input}>
            <div class={styles.des}>
              <label>Pile name</label>
              Pick a name for your new pile
            </div>
            <input
              type="text"
              placeholder="eg. Personal, School, Work"
              value={name.value}
              onChange$={(e: any) => name.value === e.target?.value}
            />
          </div>
          <div class={styles.input}>
            <div class={styles.des}>
              <label>Location</label>
              Pick a place to store this pile
            </div>

            <button title="Location" onClick$={handleClick}>
              {path.value ? path.value : "Choose a location"}
            </button>
          </div>
        </div>
        <div class={styles.buttons}>
          <a href="/" class={styles.back} onClick$={() => navigator("/")}>
            ← Back
          </a>
          <div class={styles.button} onClick$={handleSubmit}>
            Create
          </div>
        </div>
      </div>
    </div>
  );
});
