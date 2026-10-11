import { Heart, BookOpen, Calendar, Sparkles, Flower2, Moon, Sun, Bell, ShoppingBag, Check } from 'lucide-react';

interface Section {
  icon: typeof Heart;
  title: string;
  color: string;
  content: { q: string; a: string }[];
}

const SECTIONS: Section[] = [
  {
    icon: Flower2,
    title: "Qu'est-ce que les règles ?",
    color: 'from-primary-100 to-primary-50',
    content: [
      {
        q: "L'explication simple",
        a: "Chaque mois, le corps prépare un petit \"nid douillet\" dans l'utérus (l'endroit où un bébé pourrait grandir plus tard). Si ce nid n'est pas utilisé, le corps le nettoie : l'intérieur de l'utérus se détache doucement sous forme d'un petit écoulement de sang. C'est ça, les règles (ou la menstruation) !",
      },
      {
        q: "À quel âge cela arrive ?",
        a: "En général entre 10 et 16 ans (la moyenne est autour de 12-13 ans). Il n'y a pas de retard ou d'avance \"anormale\" : chaque corps suit son propre rythme ! Ne te compare pas à tes copines, ton corps fait les choses à sa vitesse.",
      },
    ],
  },
  {
    icon: Bell,
    title: "Les signes qui annoncent les règles",
    color: 'from-accent-100 to-accent-50',
    content: [
      {
        q: "Les signes physiques",
        a: "Les seins commencent à pousser (souvent 1 à 2 ans avant). Des poils apparaissent sous les aisselles et sur le pubis. Des pertes blanches (un petit fluide naturel et transparent ou blanc dans la culotte) apparaissent quelques mois avant : c'est le signe que le corps se prépare et que tout fonctionne bien !",
      },
      {
        q: "Les sensations",
        a: "On peut ressentir de légères tiraillements ou crampes dans le bas du ventre, se sentir un peu plus fatiguée ou avoir des variations d'humeur. C'est tout à fait normal et dû aux hormones — ces petits messagères chimiques qui orchestrent tout dans ton corps.",
      },
    ],
  },
  {
    icon: ShoppingBag,
    title: "La boîte d'urgence",
    color: 'from-secondary-100 to-secondary-50',
    content: [
      {
        q: "Que glisser dans ton sac",
        a: "Une petite trousse discrète avec 2-3 protections (serviettes hygiéniques ou culottes menstruelles) et une culotte de rechange pour être toujours sereine au collège ou au lycée. Mieux vaut l'avoir et ne pas en avoir besoin que l'inverse !",
      },
      {
        q: "Les types de protections",
        a: "Serviettes hygiéniques (jetables ou lavables), tampons, cup menstruelle, culottes menstruelles. Il n'y a pas de \"meilleur\" choix — teste et trouve ce qui te convient. Les culottes menstruelles sont super pratiques pour le sport.",
      },
    ],
  },
];

const FAQ = [
  {
    q: "Est-ce que ça fait mal ?",
    a: "Ça dépend de chacun. Certaines filles ne sentent presque rien, d'autres ont des crampes. Si les douleurs sont fortes, n'hésite pas à en parler à un adulte de confiance ou à un médecin. Une bouillotte sur le ventre peut aider.",
  },
  {
    q: "Combien de temps ça dure ?",
    a: "En général 3 à 7 jours. Le flux est souvent plus important au début puis diminue. La quantité de sang paraît beaucoup mais c'est en réalité seulement 30-80 ml (environ 2-5 cuillères à soupe).",
  },
  {
    q: "À quelle fréquence ?",
    a: "Le cycle moyen est de 28 jours, mais au début il peut être irrégulier (21 à 45 jours). Il faut parfois 1-2 ans pour que le cycle se régule. C'est normal !",
  },
  {
    q: "Je peux faire du sport pendant mes règles ?",
    a: "Oui, complètement ! Le sport peut même soulager les crampes grâce aux endorphines. Si tu n'en as pas envie, écoute ton corps : c'est OK de te reposer aussi.",
  },
  {
    q: "C'est dégoûtant ?",
    a: "PAS DU TOUT. Les règles sont un signe que ton corps fonctionne parfaitement. C'est naturel, sain, et toutes les femmes dans le monde vivent ça. Il n'y a aucune raison d'avoir honte.",
  },
  {
    q: "Et si je n'ai pas encore mes règles ?",
    a: "Ce n'est pas un problème ! Chaque corps à son rythme. Si tu as plus de 15 ans et que tes règles ne sont pas arrivées, parles-en à un médecin pour être rassurée, mais la plupart du temps tout va bien.",
  },
];

export function PeriodsPage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-5xl bg-gradient-to-br from-primary-300 via-primary-400 to-accent-300 p-6 sm:p-10 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/4 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3 text-white/80">
            <Heart className="w-5 h-5" />
            <span className="text-sm font-medium">Sans tabou, sans jugement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display mb-4">
            Tout comprendre sur tes règles
          </h1>
          <p className="text-lg text-white/90 max-w-lg leading-relaxed">
            Un sujet normal, expliqué simplement. Ici, aucune question est bête — on parle de ton corps avec bienveillance et sans tabou.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="grid gap-5 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <div key={section.title} className={`card p-6 bg-gradient-to-br ${section.color} border-0`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <section.icon className="w-6 h-6 text-primary-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">{section.title}</h2>
            </div>
            <div className="space-y-4">
              {section.content.map((item, i) => (
                <div key={i} className="bg-white/60 rounded-2xl p-4">
                  <p className="font-semibold text-gray-800 text-sm mb-1.5">{item.q}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Cycle syncing info */}
      <div className="card p-6 bg-gradient-to-r from-secondary-50 to-primary-50 border-0">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800 mb-2">Tes règles et ta peau — le lien secret</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Savais-tu que ta peau change pendant ton cycle ? C'est le concept de <strong>Syncing Cycle</strong> :
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2.5 text-sm text-gray-700">
                <Sun className="w-4 h-4 text-accent-500 shrink-0 mt-0.5" />
                <span><strong>Pendant l'ovulation</strong> (vers le milieu du cycle) : la peau est souvent plus éclatante et lisse.</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-700">
                <Moon className="w-4 h-4 text-secondary-500 shrink-0 mt-0.5" />
                <span><strong>Avant les règles</strong> : la peau peut devenir plus grasse, avec des boutons sur le menton et la mâchoire.</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-700">
                <Sparkles className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                <span>Le module Skincare peut adapter ta routine selon la phase de ton cycle pour garder une belle peau tout au long du mois !</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="section-title mb-5 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary-500" />
          Questions fréquentes
        </h2>
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <details key={i} className="card group">
              <summary className="cursor-pointer p-5 font-semibold text-gray-800 flex items-center justify-between list-none">
                {item.q}
                <span className="w-6 h-6 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center text-lg shrink-0 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Reassurance */}
      <div className="card p-6 bg-gradient-to-br from-success-50 to-cream-100 border-0">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-success-500 rounded-2xl flex items-center justify-center shrink-0">
            <Check className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">Rappelle-toi</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Les règles sont un signe que ton corps fonctionne bien. Il n'y a rien de honteux, de sale ou d'anormal. Si tu as des questions ou des inquiétudes, parle-en à un adulte de confiance, un médecin ou un infirmier scolaire.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
