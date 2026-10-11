import { Sparkles, Heart, Flower2, Sun, Palmtree, MapPin, Users, ArrowRight } from 'lucide-react';

const VALUES = [
  {
    icon: Flower2,
    title: 'Naturel',
    description: 'On privilégie les ingrédients simples, respectueux de ta peau, de tes cheveux et de ton corps. Rien de superflu, juste l\'essentiel.',
  },
  {
    icon: Heart,
    title: 'Bienveillance',
    description: 'Ici, pas de jugement. Chaque fille est unique et belle à sa manière. On se soutient, on s\'encourage, on grandit ensemble.',
  },
  {
    icon: Sparkles,
    title: 'Sans tabou',
    description: 'Règles, peau, cheveux, alimentation… On en parle librement, comme entre copines. Tes questions sont les bienvenues.',
  },
];

export function StoryPage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-primary-400 to-primary-600 px-6 py-16 sm:py-24 text-center text-white shadow-lg">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-52 h-52 bg-white/10 rounded-full blur-2xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-sm font-semibold mb-5">
            <Sparkles className="w-4 h-4" />
            Notre histoire
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">Clean Vibe</h1>
          <p className="mt-4 max-w-xl mx-auto text-white/90 text-base sm:text-lg">
            Deux amies, une île au soleil, et l'envie d'aider les filles comme nous à se sentir bien dans leur corps.
          </p>
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-white/80">
            <MapPin className="w-4 h-4" />
            <span>Martinique</span>
            <span className="mx-1">·</span>
            <Users className="w-4 h-4" />
            <span>Anna & Lou</span>
          </div>
        </div>
      </section>

      {/* Photo placeholder */}
      <section>
        <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-4xl bg-gradient-to-br from-primary-200 via-primary-300 to-primary-400 flex flex-col items-center justify-center text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-8 left-10 w-24 h-24 bg-white/30 rounded-full blur-xl" />
            <div className="absolute bottom-10 right-12 w-32 h-32 bg-white/20 rounded-full blur-xl" />
          </div>
          <div className="relative text-center px-6">
            <Sun className="w-10 h-10 mx-auto mb-3 text-white/80" />
            <p className="font-semibold text-lg">Photo d'Anna et Lou à venir</p>
            <p className="text-sm text-white/80 mt-1">Bientôt notre plus belle photo ici ✨</p>
          </div>
        </div>
      </section>

      {/* Story: le début */}
      <section className="card p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4 text-primary-600">
          <Palmtree className="w-5 h-5" />
          <h2 className="font-bold text-gray-800">Tout a commencé sous le soleil</h2>
        </div>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Nous sommes <strong className="text-gray-800">Anna et Lou</strong>, deux copines de 13 ans qui grandissent
            en <strong className="text-gray-800">Martinique</strong>. Ici, le soleil brille presque toute l'année, la
            mer est turquoise et les marchés débordent de mangues juteuses, de fruits de la passion et d'épices qui
            sentent bon l'aventure.
          </p>
          <p>
            Grandir dans une île des Caraïbes, c'est grandir au croisement des cultures : on a hérité de la chaleur
            créole, des rythmes antillais, et d'un incroyable mélange de carnations de peau. Chacune de nous est
            unique, et c'est précisément ce qui rend notre quotidien si beau.
          </p>
        </div>
      </section>

      {/* Story: le déclic */}
      <section className="card p-6 sm:p-8 bg-gradient-to-br from-primary-50 to-cream-100 border-0">
        <div className="flex items-center gap-2 mb-4 text-primary-600">
          <Heart className="w-5 h-5" />
          <h2 className="font-bold text-gray-800">Le déclic</h2>
        </div>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            À l'école, entre les cours et les pauses, nos copines nous posaient sans cesse des questions :
            «&nbsp;Quel produit pour ma peau qui brille&nbsp;? », «&nbsp;Comment prendre soin de mes cheveux
            crépus&nbsp;? », «&nbsp;Qu'est-ce que je peux manger pour avoir de l'énergie&nbsp;? »,
            et même «&nbsp;C'est normal que mes règles fassent mal&nbsp;? ».
          </p>
          <p>
            On s'est regardées et on s'est dit : <em>et si on créait un endroit où toutes ces questions trouvent une
            réponse, sans jugement, avec des conseils faits pour des filles de notre âge&nbsp;?</em>
          </p>
          <p>
            C'est ainsi qu'est né <strong className="text-primary-600">Clean Vibe</strong> — une application pensée
            par des filles, pour des filles, qui parle de peau, de cheveux, de repas qui font du bien et de cycles
            sans tabou.
          </p>
        </div>
      </section>

      {/* Story: notre passion */}
      <section className="card p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4 text-primary-600">
          <Sun className="w-5 h-5" />
          <h2 className="font-bold text-gray-800">Ce qui nous fait vibrer</h2>
        </div>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            On est passionnées par la santé et le bien-être des filles de notre âge. On adore tester des recettes avec
            les fruits du marché, comprendre pourquoi notre peau réagit au soleil tropical, et apprendre à écouter
            notre corps plutôt qu'à le cacher.
          </p>
          <p>
            Notre rêve&nbsp;? Que chaque fille, où qu'elle vive, puisse se sentir belle, forte et informée — fière de
            sa peau, de ses cheveux et de son histoire.
          </p>
        </div>
      </section>

      {/* Values */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <h2 className="text-xl font-bold text-gray-800">Nos valeurs</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {VALUES.map((value) => (
            <div key={value.title} className="card p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-sm">
                <value.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{value.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing message */}
      <section className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-primary-400 to-primary-600 px-6 py-12 sm:py-16 text-center text-white shadow-lg">
        <div className="absolute -top-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-white/10 rounded-full blur-2xl" />
        <div className="relative max-w-xl mx-auto">
          <Heart className="w-8 h-8 mx-auto mb-4 text-white/90" />
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">Un message d'Anna & Lou</h2>
          <p className="text-white/90 leading-relaxed">
            «&nbsp;Merci d'être là. Clean Vibe, c'est notre cœur, notre île et notre envie de partager.
            N'aie pas peur de poser tes questions, de tester, de te tromper et de recommencer. Tu es exactement
            là où tu dois être. On est avec toi, à chaque étape.&nbsp;»
          </p>
          <p className="mt-6 font-semibold">Gros bisous du soleil 🌺</p>
          <p className="text-white/80 text-sm">— Anna & Lou</p>
          <div className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-full text-sm font-semibold transition-colors cursor-default">
            Bienvenue dans Clean Vibe
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </section>
    </div>
  );
}
