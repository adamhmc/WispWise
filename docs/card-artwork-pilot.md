# Card artwork pilot

The artwork library contains the original pilot plus expansion batches for the
`haunted-house` theme. It covers all 120 legal cards: 60 direct-match cards and
60 exclusion cards. Images are generated offline, reviewed, compressed to
640×800 WebP, and then registered as approved variants in the artwork manifest.

The game engine remains authoritative. Artwork is selected only after the
semantic card and answer have already been determined.

## Prompt source

Run `npm run artwork:specs` to export the current structured prompt set to
`work/card-artwork-specs.json`. Each prompt requires:

- exactly the two named game objects;
- the exact assigned body colors;
- the canonical theme assets as visual references for both objects;
- the same defining silhouette, proportions, construction details, and outline
  style as those reference assets;
- an original WispWise illustration style;
- a low-contrast haunted-room background;
- no text, logo, border, watermark, or additional recognizable game objects.

## Approval checklist

- Exactly two game objects are visible.
- Both objects match the semantic `cardId`.
- Both silhouettes and defining details match the theme's canonical object
  assets; pose and color may change, but the object design may not.
- Assigned colors remain clear at mobile size.
- White uses neutral pure white (`#ffffff`) as its dominant fill with only
  minimal very-pale neutral shading, while gray uses a visibly darker neutral
  gray (`#667085`); they must remain distinguishable at mobile thumbnail size.
- Objects do not gain faces or limbs unless the canonical asset has them.
- No background prop resembles another selectable object.
- No text or third-party branding is present.
- The asset is marked `approved` only after review.
