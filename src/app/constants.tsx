export const NEGATIVE_TEXT =
  "(worst quality:2), (low quality:2), (normal quality:2), lowres, jpeg artifacts, blurry, ((monochrome)), ((grayscale)), ugly, duplicate, morbid, mutilated, mutation, deformed, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, missing fingers, extra digit, fewer digits, fused fingers, too many fingers, bad anatomy, bad hands, bad feet, malformed limbs, extra limbs, extra arms, extra legs, missing arms, missing legs, extra foot, bad body, bad proportions, gross proportions, facing away, looking away, tilted head, long neck, cross-eyed, skin spots, acnes, skin blemishes, (fat:1.2), polar lowres, teethcropped, dehydrated, text, error, cropped, out of frame, signature, watermark, username,";

export const CONSTANT_TEXT_1 = "Natural Lighting, Studio lighting, Cinematic Lighting, Crepuscular Rays, X-Ray, Backlight";

export const CONSTANT_TEXT_2 =
  "insanely detailed and intricate, gorgeous, Surrealistic, smooth, sharp focus, Painting, Digital Art, Concept Art, Illustration, Trending on ArtStation, in a symbolic and meaningful style, 8K";

export const TIPS_TEXT_1 =
  "Tips：Prompt 中的词语顺序代表其权重，越靠前权重越大。物体不要太多，两到三个就好。若要特别强调某个元素，可以加很多括号或者惊叹号，比如 beautiful forest background, desert!!, (((sunset))) 中会优先体现「desert」和「sunset」元素。";

export const TIPS_TEXT_2 =
  "假设你在提示词中使用了 mountain，生成的图像很可能会有树。但如果你想要生成没有树的山的图像，可以使用 mountain | tree:-10。其中 tree:-10 表示对于树的权重非常负，因此生成的图像中不会出现树。";
