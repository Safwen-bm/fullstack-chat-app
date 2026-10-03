import { Reveal } from "./shared";

const FAQS = [
  {
    q: "Do I need an account to use OnlyChat?",
    a: "Yes. Create one with your name, email and a password, then you can see everyone on the app and start chatting.",
  },
  {
    q: "Can I send photos?",
    a: "Yes. Attach an image to a message and it shows up in the conversation right away.",
  },
  {
    q: "How do I know who is online?",
    a: "A green dot appears next to people who are connected at the moment.",
  },
  {
    q: "Can I change how the app looks?",
    a: "Absolutely. Open Settings and pick from ten themes. Your choice is applied across the whole app.",
  },
  {
    q: "Does it work on my phone?",
    a: "OnlyChat is built to adapt to phones, tablets and desktops, so you can talk from wherever you are.",
  },
];

const FaqSection = () => {
  return (
    <section id="faq" className="container mx-auto max-w-3xl scroll-mt-20 px-4 py-24">
      <Reveal className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          FAQ
        </p>
        <h2 className="mt-3 text-4xl font-extrabold sm:text-5xl">Good questions</h2>
      </Reveal>

      <Reveal delay={100} className="mt-10 space-y-3">
        {FAQS.map((f, i) => (
          <div
            key={f.q}
            className="collapse collapse-plus rounded-2xl border border-base-300 bg-base-200"
          >
            <input type="radio" name="faq" defaultChecked={i === 0} />
            <div className="collapse-title text-base font-semibold">{f.q}</div>
            <div className="collapse-content text-sm text-base-content/70">
              <p>{f.a}</p>
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  );
};

export default FaqSection;