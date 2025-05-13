// Prompts adjusted for different age groups
const AGE_GROUP_PROMPTS = {
  "5-7": "The content should be very simple, using short sentences and basic vocabulary. Explain concepts in concrete terms with familiar examples. Include colorful descriptions and fun facts that are easy to grasp. Content should be enthusiastic and encourage curiosity.",
  "8-10": "The content should use moderate vocabulary with occasional new words explained in context. Include more details and a broader range of facts. Make connections between concepts and real-world applications. Content should be engaging and educational.",
  "11-12": "The content can use more advanced vocabulary and introduce more complex concepts. Include historical context, scientific principles, and deeper connections between ideas. Content should be intellectually stimulating while still being accessible."
};

// Card count for different course lengths
const COURSE_LENGTH_CARDS = {
  "quick": 5,
  "standard": 10,
  "deep": 15
};

// Function to generate mock learning cards about Dinosaurs
export async function generateLearningCards(topic: string, ageGroup: string, courseLength: string) {
  const numCards = COURSE_LENGTH_CARDS[courseLength as keyof typeof COURSE_LENGTH_CARDS];
  console.log(`Generating ${numCards} cards about "${topic}" for age group ${ageGroup}`);
  
  // For development, use predefined cards based on the topic
  const allCards = generateSampleCards(topic, ageGroup);
  
  // Return the requested number of cards
  return allCards.slice(0, numCards);
}

// Helper function to generate sample cards for development
function generateSampleCards(topic: string, ageGroup: string) {
  // Basic structure for cards based on age group
  const contentComplexity = ageGroup === "5-7" ? "simple" : 
                            ageGroup === "8-10" ? "moderate" : "advanced";
  
  // Normalize topic to lowercase for matching
  const normalizedTopic = topic.toLowerCase();
  
  // Default cards (dinosaurs)
  const defaultCards = [
    {
      id: 1,
      title: "What Are Dinosaurs?",
      content: createContent("Dinosaurs were amazing animals that lived millions of years ago. They were reptiles, like lizards and snakes, but many were much bigger! They lived for about 165 million years, which is a very long time.", "Scientists called paleontologists dig up dinosaur bones and fossils. They study these fossils to learn about how dinosaurs looked, what they ate, and how they lived. Some dinosaurs were as small as chickens, while others were as big as buildings!", contentComplexity),
      funFact: "The word 'dinosaur' means 'terrible lizard' in Greek."
    },
    {
      id: 2,
      title: "Dinosaur Diet",
      content: createContent("Dinosaurs ate different kinds of food. Some dinosaurs called herbivores only ate plants. They had flat teeth for grinding tough plants. Triceratops and Brachiosaurus were herbivores.", "Other dinosaurs called carnivores ate meat. They had sharp, pointed teeth for tearing meat. Tyrannosaurus Rex and Velociraptor were carnivores. And some dinosaurs called omnivores ate both plants and meat!", contentComplexity),
      funFact: "Some plant-eating dinosaurs swallowed stones to help grind food in their stomachs."
    },
    {
      id: 3,
      title: "Tyrannosaurus Rex",
      content: createContent("Tyrannosaurus Rex, or T-Rex, was one of the most fearsome dinosaurs. It had a massive head with jaws full of sharp teeth. Each tooth was about the size of a banana! T-Rex lived about 68 million years ago.", "T-Rex walked on two strong legs and had tiny arms. Even though its arms were small, T-Rex was very powerful. It could run fast and had a great sense of smell. Scientists think T-Rex could eat 500 pounds of meat in one bite!", contentComplexity),
      funFact: "T-Rex had the strongest bite of any land animal ever discovered."
    },
    {
      id: 4,
      title: "Triceratops",
      content: createContent("Triceratops was a dinosaur with three horns on its face. It had a big horn above each eye and a smaller horn on its nose. Triceratops means 'three-horned face' in Greek.", "Triceratops also had a large bony frill that protected its neck. It was a plant-eater with a beak-like mouth and rows of teeth for chewing tough plants. Triceratops could grow as long as a school bus!", contentComplexity),
      funFact: "Scientists have found evidence that Triceratops horns were used for fighting each other, not just for defense against predators."
    },
    {
      id: 5,
      title: "Velociraptor",
      content: createContent("Velociraptors were small, fast dinosaurs. They were about the size of a turkey, not as big as shown in movies! They had sharp claws and teeth and were very smart hunters.", "Velociraptors had a special large claw on each foot that they used for catching prey. They could run very fast and likely hunted in groups. Scientists think they might have had feathers, like birds today!", contentComplexity),
      funFact: "Velociraptors were probably as smart as modern birds like crows and ravens."
    },
    {
      id: 6,
      title: "Brachiosaurus",
      content: createContent("Brachiosaurus was one of the tallest dinosaurs. It had a very long neck that helped it eat leaves from the tops of trees. Its name means 'arm lizard' because its front legs were longer than its back legs.", "Brachiosaurus could be as tall as a four-story building! It was a gentle giant that only ate plants. It had nostrils on the top of its head, which might have helped it breathe while standing in deep water.", contentComplexity),
      funFact: "Scientists think Brachiosaurus could live for up to 100 years."
    },
    {
      id: 7, 
      title: "Stegosaurus",
      content: createContent("Stegosaurus had large bony plates along its back and spikes on its tail. The plates were arranged in two rows along its back and might have helped control its body temperature.", "Stegosaurus had a brain the size of a walnut, which was very small for its body size. It was a plant-eater with a beak-like mouth for eating low-growing plants. The spikes on its tail were used for defense against predators.", contentComplexity),
      funFact: "The spikes on a Stegosaurus tail are called 'thagomizers,' a name that came from a cartoon!"
    },
    {
      id: 8,
      title: "Pterodactyls",
      content: createContent("Pterodactyls were flying reptiles that lived at the same time as dinosaurs, but they weren't actually dinosaurs! They had wings made of skin stretched between their arms and legs, like bats today.", "Pterodactyls had hollow bones that made them light enough to fly. Some were small, but others were huge with wingspans wider than a small airplane! They caught food with their beaks and probably ate fish and small animals.", contentComplexity),
      funFact: "The largest pterosaur, Quetzalcoatlus, had a wingspan of about 36 feet - as wide as a small plane!"
    },
    {
      id: 9,
      title: "How Dinosaurs Disappeared",
      content: createContent("Dinosaurs disappeared about 66 million years ago. Most scientists think an asteroid (a big rock from space) hit Earth and caused big changes in the weather and environment.", "The asteroid impact created huge dust clouds that blocked the sun and made Earth very cold. Plants couldn't grow without sunlight, and many animals, including dinosaurs, couldn't find enough food to survive. This event is called a mass extinction.", contentComplexity),
      funFact: "Not all dinosaurs went extinct! Birds are actually modern relatives of dinosaurs."
    },
    {
      id: 10,
      title: "Dinosaur Fossils",
      content: createContent("Fossils are like stone pictures of animals and plants that lived long ago. When a dinosaur died, sometimes it got covered by mud and sand. Over millions of years, the bones turned into rock.", "Scientists dig up these fossils carefully and put them together like puzzles. The first dinosaur fossils were discovered in the 1800s. Now there are dinosaur museums all over the world where you can see these amazing creatures!", contentComplexity),
      funFact: "The largest complete dinosaur skeleton ever found is a Brachiosaurus that was 85 feet long!"
    },
    {
      id: 11,
      title: "Dinosaur Eggs and Babies",
      content: createContent("All dinosaurs hatched from eggs, just like birds today. Scientists have found fossilized dinosaur eggs and nests. Some dinosaur eggs were round, while others were oval-shaped.", "Baby dinosaurs grew inside these eggs until they were ready to hatch. Some dinosaur parents took care of their babies and brought them food. Other baby dinosaurs had to find food on their own as soon as they hatched.", contentComplexity),
      funFact: "Some dinosaur eggs were as big as footballs!"
    },
    {
      id: 12,
      title: "Dinosaur Tracks",
      content: createContent("Dinosaurs left footprints when they walked through mud that later turned to stone. Scientists call these fossilized footprints 'trace fossils.' They help us learn how dinosaurs moved.", "From dinosaur tracks, scientists can tell how fast dinosaurs walked or ran, whether they traveled in groups, and even how they balanced. Some dinosaur track sites have hundreds of footprints from many different kinds of dinosaurs!", contentComplexity),
      funFact: "The longest trail of dinosaur footprints ever found is 110 meters long (about as long as a football field)."
    },
    {
      id: 13,
      title: "Dinosaur Colors",
      content: createContent("For a long time, scientists didn't know what colors dinosaurs were. But now, they've found some dinosaur fossils that preserved tiny structures that held pigments - the things that give color.", "By studying these structures, scientists can sometimes tell what color a dinosaur might have been. Some dinosaurs had feathers that were black, brown, red, or even iridescent (shiny and colorful, like a hummingbird)!", contentComplexity),
      funFact: "A dinosaur called Microraptor had feathers that were iridescent black, like a crow's feathers in the sunlight."
    },
    {
      id: 14,
      title: "Dinosaurs Around the World",
      content: createContent("Dinosaurs lived on every continent, including Antarctica! Back when dinosaurs were alive, the continents were arranged differently than they are today.", "Different types of dinosaurs lived in different places. For example, T-Rex fossils have only been found in North America and Asia. Spinosaurus, a dinosaur with a sail on its back, lived in Africa. Scientists continue to discover new dinosaur species all around the world!", contentComplexity),
      funFact: "New dinosaur species are still being discovered today - about 10-15 new kinds every year!"
    },
    {
      id: 15,
      title: "Living Like Dinosaurs",
      content: createContent("Though dinosaurs are gone, some modern animals remind us of them. Crocodiles and alligators are ancient reptiles that lived alongside dinosaurs and survived the extinction. They haven't changed much in millions of years!", "Birds are actually living dinosaurs! They evolved from small, feathered dinosaurs that survived the extinction event. So when you watch a bird outside your window, you're seeing a modern dinosaur descendant. Isn't that amazing?", contentComplexity),
      funFact: "A chicken's DNA is not very different from a T-Rex's DNA. Scientists have even managed to make chicken embryos grow dinosaur-like snouts instead of beaks!"
    }
  ];
  
  // Return different sample cards based on the topic (simplified for this example)
  if (normalizedTopic.includes("space") || normalizedTopic.includes("planet")) {
    // Space/planets-themed cards would go here
    return defaultCards.map((card, index) => ({
      ...card,
      id: index + 1,
      title: card.title.replace("Dinosaur", "Space"),
      content: card.content.replace(/dinosaur/gi, "planet"),
      funFact: "Space is completely silent because there is no air to carry sound waves."
    }));
  } else if (normalizedTopic.includes("ocean") || normalizedTopic.includes("sea")) {
    // Ocean-themed cards would go here
    return defaultCards.map((card, index) => ({
      ...card,
      id: index + 1,
      title: card.title.replace("Dinosaur", "Ocean"),
      content: card.content.replace(/dinosaur/gi, "sea creature"),
      funFact: "The ocean contains about 97% of Earth's water."
    }));
  }
  
  // For any other topic, return dinosaur cards
  return defaultCards;
}

// Helper function to create appropriate content based on age complexity
function createContent(paragraph1: string, paragraph2: string, complexity: string): string {
  if (complexity === "simple") {
    // Simplify text for younger children
    return `<p>${paragraph1.replace(/\b\w{8,}\b/g, match => {
      // Replace long words with simpler alternatives where possible
      const simplifications: Record<string, string> = {
        "discovered": "found",
        "paleontologists": "scientists",
        "approximately": "about",
        "environment": "world around us",
        "extinction": "dying out"
      };
      return simplifications[match.toLowerCase()] || match;
    })}</p><p>${paragraph2.split('.').slice(0, 2).join('.')}.</p>`;
  } else if (complexity === "moderate") {
    // Keep original text for moderate complexity
    return `<p>${paragraph1}</p><p>${paragraph2}</p>`;
  } else {
    // Add more detail and advanced concepts for older children
    return `<p>${paragraph1}</p><p>${paragraph2}</p><p>Scientists continue to study and learn more about this fascinating subject. They use advanced technology like CT scans and computer modeling to better understand these amazing creatures from Earth's past.</p>`;
  }
}
