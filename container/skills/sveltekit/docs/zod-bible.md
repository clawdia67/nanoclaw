# ZOD BIBLE - Complete Zod Documentation Reference

> This document is a comprehensive reference for Zod, a TypeScript-first schema validation library. It is designed to be used by LLMs or developers to implement Zod features.

## Table of Contents

1. [Introduction](#introduction)
2. [Installation & Requirements](#installation--requirements)
3. [Basic Usage](#basic-usage)
4. [Schema Types](#schema-types)
   - [Primitives](#primitives)
   - [Literals](#literals)
   - [Strings](#strings)
   - [String Formats](#string-formats)
   - [Template Literals](#template-literals)
   - [Numbers](#numbers)
   - [Integers](#integers)
   - [BigInts](#bigints)
   - [Booleans](#booleans)
   - [Dates](#dates)
   - [Enums](#enums)
   - [Stringbools](#stringbools)
   - [Optionals](#optionals)
   - [Nullables](#nullables)
   - [Nullish](#nullish)
   - [Unknown & Any](#unknown--any)
   - [Never](#never)
5. [Complex Types](#complex-types)
   - [Objects](#objects)
   - [Recursive Objects](#recursive-objects)
   - [Arrays](#arrays)
   - [Tuples](#tuples)
   - [Unions](#unions)
   - [Discriminated Unions](#discriminated-unions)
   - [Intersections](#intersections)
   - [Records](#records)
   - [Maps](#maps)
   - [Sets](#sets)
   - [Files](#files)
6. [Schema Methods](#schema-methods)
   - [Parsing Methods](#parsing-methods)
   - [Type Inference](#type-inference)
   - [Refinements](#refinements)
   - [Transforms](#transforms)
   - [Pipes](#pipes)
   - [Codecs](#codecs)
   - [Defaults & Prefaults](#defaults--prefaults)
   - [Catch](#catch)
   - [Branded Types](#branded-types)
   - [Readonly](#readonly)
7. [Error Handling](#error-handling)
   - [ZodError](#zoderror)
   - [Error Customization](#error-customization)
   - [Error Formatting](#error-formatting)
   - [Internationalization](#internationalization)
8. [JSON Schema](#json-schema)
9. [Metadata & Registries](#metadata--registries)
10. [Zod Mini](#zod-mini)
11. [Zod Core](#zod-core)
12. [For Library Authors](#for-library-authors)
13. [Migration from Zod 3 to Zod 4](#migration-from-zod-3-to-zod-4)

---

## Introduction

Zod is a TypeScript-first validation library. Using Zod, you can define *schemas* to validate data, from a simple `string` to a complex nested object.

```ts
import * as z from "zod";

const User = z.object({
  name: z.string(),
});

// some untrusted data...
const input = { /* stuff */ };

// the parsed result is validated and type safe!
const data = User.parse(input);

// so you can use it with confidence :)
console.log(data.name);
```

### Key Features

- Zero external dependencies
- Works in Node.js and all modern browsers
- Tiny: 2kb core bundle (gzipped)
- Immutable API: methods return a new instance
- Concise interface
- Works with TypeScript and plain JS
- Built-in JSON Schema conversion
- Extensive ecosystem

---

## Installation & Requirements

```sh
npm install zod
```

> Zod is also available as `@zod/zod` on [jsr.io](https://jsr.io/@zod/zod).

### TypeScript Requirements

Zod is tested against TypeScript v5.5 and later. You must enable `strict` mode in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

---

## Basic Usage

### Defining a Schema

```ts
import * as z from "zod";

const Player = z.object({
  username: z.string(),
  xp: z.number()
});
```

### Parsing Data

Use `.parse` to validate an input. If valid, Zod returns a strongly-typed *deep clone* of the input.

```ts
Player.parse({ username: "billie", xp: 100 });
// => returns { username: "billie", xp: 100 }
```

For asynchronous schemas (with async refinements or transforms):

```ts
await Player.parseAsync({ username: "billie", xp: 100 });
```

### Safe Parsing

Use `.safeParse()` to get a result object instead of throwing:

```ts
const result = Player.safeParse({ username: 42, xp: "100" });
if (!result.success) {
  result.error;   // ZodError instance
} else {
  result.data;    // { username: string; xp: number }
}
```

Async version:

```ts
await schema.safeParseAsync("hello");
```

### Handling Errors

When validation fails, `.parse()` throws a `ZodError`:

```ts
try {
  Player.parse({ username: 42, xp: "100" });
} catch(error){
  if(error instanceof z.ZodError){
    error.issues;
    /* [
      {
        expected: 'string',
        code: 'invalid_type',
        path: [ 'username' ],
        message: 'Invalid input: expected string'
      },
      {
        expected: 'number',
        code: 'invalid_type',
        path: [ 'xp' ],
        message: 'Invalid input: expected number'
      }
    ] */
  }
}
```

### Type Inference

Extract the TypeScript type from a schema with `z.infer<>`:

```ts
const Player = z.object({
  username: z.string(),
  xp: z.number()
});

type Player = z.infer<typeof Player>;
// { username: string; xp: number }

const player: Player = { username: "billie", xp: 100 };
```

For schemas where input and output types differ:

```ts
const mySchema = z.string().transform((val) => val.length);

type MySchemaIn = z.input<typeof mySchema>;   // string
type MySchemaOut = z.output<typeof mySchema>; // number
```

---

## Schema Types

### Primitives

```ts
import * as z from "zod";

z.string();
z.number();
z.bigint();
z.boolean();
z.symbol();
z.undefined();
z.null();
```

#### Coercion

To coerce input data to the appropriate type:

```ts
z.coerce.string();    // String(input)
z.coerce.number();    // Number(input)
z.coerce.boolean();   // Boolean(input)
z.coerce.bigint();    // BigInt(input)
z.coerce.date();      // new Date(input)
```

Example:

```ts
const schema = z.coerce.string();

schema.parse("tuna");    // => "tuna"
schema.parse(42);        // => "42"
schema.parse(true);      // => "true"
schema.parse(null);      // => "null"
```

**Note on boolean coercion:** Any truthy value becomes `true`, any falsy value becomes `false`.

```ts
const schema = z.coerce.boolean();

schema.parse("tuna"); // => true
schema.parse("true"); // => true
schema.parse("false"); // => true (truthy string!)
schema.parse(1); // => true

schema.parse(0); // => false
schema.parse(""); // => false
schema.parse(undefined); // => false
schema.parse(null); // => false
```

### Literals

Literal schemas represent a literal type like `"hello world"` or `5`:

```ts
const tuna = z.literal("tuna");
const twelve = z.literal(12);
const twobig = z.literal(2n);
const tru = z.literal(true);
```

For `null` and `undefined`:

```ts
z.null();
z.undefined();
z.void(); // equivalent to z.undefined()
```

Multiple literal values:

```ts
const colors = z.literal(["red", "green", "blue"]);

colors.parse("green"); // OK
colors.parse("yellow"); // Error
```

### Strings

String validations:

```ts
z.string().max(5);
z.string().min(5);
z.string().length(5);
z.string().regex(/^[a-z]+$/);
z.string().startsWith("aaa");
z.string().endsWith("zzz");
z.string().includes("---");
z.string().uppercase();
z.string().lowercase();
```

String transforms:

```ts
z.string().trim();        // trim whitespace
z.string().toLowerCase(); // toLowerCase
z.string().toUpperCase(); // toUpperCase
z.string().normalize();   // normalize unicode characters
```

### String Formats

```ts
z.email();
z.uuid();
z.url();
z.httpUrl();       // http or https URLs only
z.hostname();
z.emoji();         // validates a single emoji character
z.base64();
z.base64url();
z.hex();
z.jwt();
z.nanoid();
z.cuid();
z.cuid2();
z.ulid();
z.ipv4();
z.ipv6();
z.mac();
z.cidrv4();        // ipv4 CIDR block
z.cidrv6();        // ipv6 CIDR block
z.hash("sha256");  // or "sha1", "sha384", "sha512", "md5"
z.iso.date();
z.iso.time();
z.iso.datetime();
z.iso.duration();
```

#### Email Validation

```ts
z.email();

// Custom patterns
z.email({ pattern: z.regexes.email });       // Zod's default (Gmail rules)
z.email({ pattern: z.regexes.html5Email });  // Browser input[type=email] validation
z.email({ pattern: z.regexes.rfc5322Email }); // RFC 5322
z.email({ pattern: z.regexes.unicodeEmail }); // Allows Unicode
```

#### UUID Validation

```ts
z.uuid();
z.uuid({ version: "v4" }); // Specific version: "v1"-"v8"
z.uuidv4();
z.uuidv6();
z.uuidv7();
z.guid(); // Any UUID-like 8-4-4-4-12 hex pattern
```

#### URL Validation

```ts
const schema = z.url();

schema.parse("https://example.com"); // OK
schema.parse("http://localhost"); // OK
schema.parse("mailto:noreply@zod.dev"); // OK

// With hostname validation
z.url({ hostname: /^example\.com$/ });

// With protocol validation
z.url({ protocol: /^https$/ });

// HTTP URLs only
const httpUrl = z.url({
  protocol: /^https?$/,
  hostname: z.regexes.domain
});

// Normalize URLs
z.url({ normalize: true });
```

#### ISO Datetime

```ts
const datetime = z.iso.datetime();

datetime.parse("2020-01-01T06:15:00Z"); // OK
datetime.parse("2020-01-01T06:15:00.123Z"); // OK
datetime.parse("2020-01-01T06:15:00+02:00"); // Error (offsets not allowed by default)

// Allow timezone offsets
z.iso.datetime({ offset: true });

// Allow unqualified datetimes
z.iso.datetime({ local: true });

// Constrain precision
z.iso.datetime({ precision: -1 }); // minute precision (no seconds)
z.iso.datetime({ precision: 0 });  // second precision
z.iso.datetime({ precision: 3 });  // millisecond precision
```

#### ISO Date and Time

```ts
const date = z.iso.date();
date.parse("2020-01-01"); // OK
date.parse("2020-1-1"); // Error

const time = z.iso.time();
time.parse("03:15"); // OK
time.parse("03:15:00"); // OK
time.parse("03:15:00.9999999"); // OK (arbitrary precision)
time.parse("03:15:00Z"); // Error (no Z allowed)
```

#### IP Addresses

```ts
const ipv4 = z.ipv4();
ipv4.parse("192.168.0.0"); // OK

const ipv6 = z.ipv6();
ipv6.parse("2001:db8:85a3::8a2e:370:7334"); // OK

// CIDR blocks
const cidrv4 = z.cidrv4();
cidrv4.parse("192.168.0.0/24"); // OK

const cidrv6 = z.cidrv6();
cidrv6.parse("2001:db8::/32"); // OK
```

#### MAC Addresses

```ts
const mac = z.mac();
mac.parse("00:1A:2B:3C:4D:5E");  // OK
mac.parse("00-1a-2b-3c-4d-5e");  // Error (colon-delimited by default)

// Custom delimiter
const dashMac = z.mac({ delimiter: "-" });
dashMac.parse("00-1A-2B-3C-4D-5E"); // OK
```

#### JWTs

```ts
z.jwt();
z.jwt({ alg: "HS256" });
```

#### Hashes

```ts
z.hash("md5");
z.hash("sha1");
z.hash("sha256");
z.hash("sha384");
z.hash("sha512");

// Different encodings
z.hash("sha256", { enc: "hex" });       // default
z.hash("sha256", { enc: "base64" });
z.hash("sha256", { enc: "base64url" });
```

#### Custom String Formats

```ts
const coolId = z.stringFormat("cool-id", (val) => {
  return val.length === 100 && val.startsWith("cool-");
});

// Or with regex
z.stringFormat("cool-id", /^cool-[a-z0-9]{95}$/);
```

### Template Literals

```ts
const schema = z.templateLiteral(["hello, ", z.string(), "!"]);
// `hello, ${string}!`

z.templateLiteral(["hi there"]);
// `hi there`

z.templateLiteral(["email: ", z.string()]);
// `email: ${string}`

z.templateLiteral([z.number(), z.enum(["px", "em", "rem"])]);
// `${number}px` | `${number}em` | `${number}rem`
```

### Numbers

```ts
const schema = z.number();

schema.parse(3.14);      // OK
schema.parse(NaN);       // Error
schema.parse(Infinity);  // Error
```

Number validations:

```ts
z.number().gt(5);            // > 5
z.number().gte(5);           // >= 5 (alias .min(5))
z.number().lt(5);            // < 5
z.number().lte(5);           // <= 5 (alias .max(5))
z.number().positive();       // > 0
z.number().nonnegative();    // >= 0
z.number().negative();       // < 0
z.number().nonpositive();    // <= 0
z.number().multipleOf(5);    // divisible by 5 (alias .step(5))
```

For NaN validation:

```ts
z.nan().parse(NaN); // OK
```

### Integers

```ts
z.int();     // restricts to safe integer range
z.int32();   // restrict to int32 range
z.uint32();  // unsigned int32
z.float32(); // 32-bit float range
z.float64(); // 64-bit float range
```

### BigInts

```ts
z.bigint();

z.bigint().gt(5n);
z.bigint().gte(5n);           // alias .min(5n)
z.bigint().lt(5n);
z.bigint().lte(5n);           // alias .max(5n)
z.bigint().positive();
z.bigint().nonnegative();
z.bigint().negative();
z.bigint().nonpositive();
z.bigint().multipleOf(5n);    // alias .step(5n)

// BigInt formats
z.int64();    // [-9223372036854775808n, 9223372036854775807n]
z.uint64();   // [0n, 18446744073709551615n]
```

### Booleans

```ts
z.boolean().parse(true); // => true
z.boolean().parse(false); // => false
```

### Dates

```ts
z.date().safeParse(new Date()); // success: true
z.date().safeParse("2022-01-12T06:15:00.000Z"); // success: false

// Date validations
z.date().min(new Date("1900-01-01"), { error: "Too old!" });
z.date().max(new Date(), { error: "Too young!" });
```

### Enums

```ts
const FishEnum = z.enum(["Salmon", "Tuna", "Trout"]);

FishEnum.parse("Salmon"); // => "Salmon"
FishEnum.parse("Swordfish"); // => Error

// Important: use `as const` for variable arrays
const fish = ["Salmon", "Tuna", "Trout"] as const;
const FishEnum = z.enum(fish);
type FishEnum = z.infer<typeof FishEnum>; // "Salmon" | "Tuna" | "Trout"
```

Enum-like objects:

```ts
const Fish = {
  Salmon: 0,
  Tuna: 1
} as const;

const FishEnum = z.enum(Fish);
FishEnum.parse(Fish.Salmon); // OK
FishEnum.parse(0); // OK
FishEnum.parse(2); // Error
```

TypeScript enums:

```ts
enum Fish {
  Salmon = 0,
  Tuna = 1
}

const FishEnum = z.enum(Fish);
```

Enum methods:

```ts
const FishEnum = z.enum(["Salmon", "Tuna", "Trout"]);

// Get enum object
FishEnum.enum;
// => { Salmon: "Salmon", Tuna: "Tuna", Trout: "Trout" }

// Create new enum excluding values
const TunaOnly = FishEnum.exclude(["Salmon", "Trout"]);

// Create new enum extracting values
const SalmonAndTrout = FishEnum.extract(["Salmon", "Trout"]);
```

### Stringbools

Parse string "boolish" values to boolean:

```ts
const strbool = z.stringbool();

strbool.parse("true")     // => true
strbool.parse("1")        // => true
strbool.parse("yes")      // => true
strbool.parse("on")       // => true
strbool.parse("y")        // => true
strbool.parse("enabled")  // => true

strbool.parse("false")    // => false
strbool.parse("0")        // => false
strbool.parse("no")       // => false
strbool.parse("off")      // => false
strbool.parse("n")        // => false
strbool.parse("disabled") // => false

strbool.parse("other")    // => Error
```

Custom truthy/falsy values:

```ts
z.stringbool({
  truthy: ["yes", "true"],
  falsy: ["no", "false"],
});

// Case-sensitive
z.stringbool({ case: "sensitive" });
```

### Optionals

Make a schema accept `undefined`:

```ts
z.optional(z.literal("yoda")); // or z.literal("yoda").optional()

// Unwrap to get inner schema
optionalYoda.unwrap(); // ZodLiteral<"yoda">
```

### Nullables

Make a schema accept `null`:

```ts
z.nullable(z.literal("yoda")); // or z.literal("yoda").nullable()

// Unwrap to get inner schema
nullableYoda.unwrap(); // ZodLiteral<"yoda">
```

### Nullish

Make a schema both optional and nullable:

```ts
const nullishYoda = z.nullish(z.literal("yoda"));
// "yoda" | null | undefined
```

### Unknown & Any

```ts
z.any();     // inferred type: any
z.unknown(); // inferred type: unknown
```

### Never

No value will pass validation:

```ts
z.never(); // inferred type: never
```

---

## Complex Types

### Objects

```ts
const Person = z.object({
  name: z.string(),
  age: z.number(),
});

type Person = z.infer<typeof Person>;
// { name: string; age: number; }
```

Optional properties:

```ts
const Dog = z.object({
  name: z.string(),
  age: z.number().optional(),
});

Dog.parse({ name: "Yeller" }); // OK
```

By default, unrecognized keys are stripped:

```ts
Dog.parse({ name: "Yeller", extraKey: true });
// => { name: "Yeller" }
```

#### Strict Objects

Throw error on unknown keys:

```ts
const StrictDog = z.strictObject({
  name: z.string(),
});

StrictDog.parse({ name: "Yeller", extraKey: true });
// Error: Unrecognized key
```

#### Loose Objects

Allow unknown keys to pass through:

```ts
const LooseDog = z.looseObject({
  name: z.string(),
});

LooseDog.parse({ name: "Yeller", extraKey: true });
// => { name: "Yeller", extraKey: true }
```

#### Catchall

Validate unrecognized keys with a schema:

```ts
const DogWithStrings = z.object({
  name: z.string(),
}).catchall(z.string());

DogWithStrings.parse({ name: "Yeller", extraKey: "extraValue" }); // OK
DogWithStrings.parse({ name: "Yeller", extraKey: 42 }); // Error
```

#### Object Methods

```ts
const Dog = z.object({ name: z.string(), age: z.number() });

// Access shape
Dog.shape.name; // string schema
Dog.shape.age;  // number schema

// Create enum from keys
Dog.keyof(); // ZodEnum<["name", "age"]>

// Extend with additional fields
const DogWithBreed = Dog.extend({ breed: z.string() });

// Alternative: spread syntax (recommended for tsc performance)
const DogWithBreed = z.object({
  ...Dog.shape,
  breed: z.string(),
});

// Safe extend (won't overwrite with incompatible type)
Dog.safeExtend({ name: z.string().min(1) }); // OK
Dog.safeExtend({ name: z.number() }); // Error

// Pick keys
const JustTheName = Dog.pick({ name: true });

// Omit keys
const DogNoAge = Dog.omit({ age: true });

// Make all properties optional
const PartialDog = Dog.partial();

// Make specific properties optional
Dog.partial({ age: true });

// Make all properties required
const RequiredDog = Dog.required();

// Make specific properties required
Dog.required({ age: true });
```

### Recursive Objects

Use getters for self-referential types:

```ts
const Category = z.object({
  name: z.string(),
  get subcategories(){
    return z.array(Category)
  }
});

type Category = z.infer<typeof Category>;
// { name: string; subcategories: Category[] }
```

Mutually recursive types:

```ts
const User = z.object({
  email: z.email(),
  get posts(){
    return z.array(Post)
  }
});

const Post = z.object({
  title: z.string(),
  get author(){
    return User
  }
});
```

**Warning:** Passing cyclical data into Zod will cause an infinite loop.

### Arrays

```ts
const stringArray = z.array(z.string()); // or z.string().array()

// Access inner schema
stringArray.unwrap(); // string schema

// Array validations
z.array(z.string()).min(5);    // 5 or more items
z.array(z.string()).max(5);    // 5 or fewer items
z.array(z.string()).length(5); // exactly 5 items
```

### Tuples

Fixed-length arrays with different schemas per index:

```ts
const MyTuple = z.tuple([
  z.string(),
  z.number(),
  z.boolean()
]);

type MyTuple = z.infer<typeof MyTuple>;
// [string, number, boolean]

// With rest argument
const variadicTuple = z.tuple([z.string()], z.number());
// [string, ...number[]]
```

### Unions

```ts
const stringOrNumber = z.union([z.string(), z.number()]);
// string | number

stringOrNumber.parse("foo"); // OK
stringOrNumber.parse(14); // OK

// Access options
stringOrNumber.options; // [ZodString, ZodNumber]
```

#### Exclusive Unions (XOR)

Exactly one option must match:

```ts
const schema = z.xor([z.string(), z.number()]);

schema.parse("hello"); // OK
schema.parse(42);      // OK
schema.parse(true);    // Error (zero matches)

// If input could match multiple options, it fails
const overlapping = z.xor([z.string(), z.any()]);
overlapping.parse("hello"); // Error (matches both)
```

### Discriminated Unions

Efficient union parsing using a discriminator key:

```ts
const MyResult = z.discriminatedUnion("status", [
  z.object({ status: z.literal("success"), data: z.string() }),
  z.object({ status: z.literal("failed"), error: z.string() }),
]);
```

Nested discriminated unions:

```ts
const BaseError = { status: z.literal("failed"), message: z.string() };
const MyErrors = z.discriminatedUnion("code", [
  z.object({ ...BaseError, code: z.literal(400) }),
  z.object({ ...BaseError, code: z.literal(401) }),
  z.object({ ...BaseError, code: z.literal(500) }),
]);

const MyResult = z.discriminatedUnion("status", [
  z.object({ status: z.literal("success"), data: z.string() }),
  MyErrors
]);
```

### Intersections

```ts
const a = z.union([z.number(), z.string()]);
const b = z.union([z.number(), z.boolean()]);
const c = z.intersection(a, b);

type c = z.infer<typeof c>; // number
```

For objects:

```ts
const Person = z.object({ name: z.string() });
const Employee = z.object({ role: z.string() });
const EmployedPerson = z.intersection(Person, Employee);
// Person & Employee
```

**Note:** Prefer `A.extend(B.shape)` over intersections for object merging.

### Records

```ts
const IdCache = z.record(z.string(), z.string());
type IdCache = z.infer<typeof IdCache>; // Record<string, string>

// With enum keys (exhaustive checking)
const Keys = z.enum(["id", "name", "email"]);
const Person = z.record(Keys, z.string());
// { id: string; name: string; email: string }

// Partial record (no exhaustive checking)
const PartialPerson = z.partialRecord(Keys, z.string());
// { id?: string; name?: string; email?: string }

// Loose record (pass through non-matching keys)
const schema = z.looseRecord(z.string().regex(/^S_/), z.string());
```

### Maps

```ts
const StringNumberMap = z.map(z.string(), z.number());
type StringNumberMap = z.infer<typeof StringNumberMap>; // Map<string, number>
```

### Sets

```ts
const NumberSet = z.set(z.number());
type NumberSet = z.infer<typeof NumberSet>; // Set<number>

// Set validations
z.set(z.string()).min(5);  // 5 or more items
z.set(z.string()).max(5);  // 5 or fewer items
z.set(z.string()).size(5); // exactly 5 items
```

### Files

```ts
const fileSchema = z.file();

fileSchema.min(10_000);              // minimum size (bytes)
fileSchema.max(1_000_000);           // maximum size (bytes)
fileSchema.mime("image/png");        // MIME type
fileSchema.mime(["image/png", "image/jpeg"]); // multiple MIME types
```

---

## Schema Methods

### Parsing Methods

All schemas implement these methods:

```ts
const mySchema = z.string();

// Throws ZodError on failure
mySchema.parse(data);

// Returns result object
mySchema.safeParse(data);
// { success: true, data: T } | { success: false, error: ZodError }

// Async versions (required for async refinements/transforms)
await mySchema.parseAsync(data);
await mySchema.safeParseAsync(data);
```

### Type Inference

```ts
type MyType = z.infer<typeof mySchema>;      // output type
type MyTypeIn = z.input<typeof mySchema>;    // input type
type MyTypeOut = z.output<typeof mySchema>;  // output type (same as infer)
```

### Refinements

#### `.refine()`

Custom validation:

```ts
const myString = z.string().refine((val) => val.length <= 255);

// With custom error
z.string().refine((val) => val.length > 8, { error: "Too short!" });

// With abort (stops further checks on failure)
z.string().refine((val) => val.length > 8, { error: "Too short!", abort: true });

// With custom path (for objects)
z.object({
  password: z.string(),
  confirm: z.string(),
}).refine((data) => data.password === data.confirm, {
  message: "Passwords don't match",
  path: ["confirm"],
});

// Async refinement
z.string().refine(async (id) => {
  // verify in database
  return true;
});
```

**Important:** Refinement functions should never throw. Return a falsy value to signal failure.

#### `.superRefine()`

Create multiple issues with any issue type:

```ts
const UniqueStringArray = z.array(z.string()).superRefine((val, ctx) => {
  if (val.length > 3) {
    ctx.addIssue({
      code: "too_big",
      maximum: 3,
      origin: "array",
      inclusive: true,
      message: "Too many items",
      input: val,
    });
  }

  if (val.length !== new Set(val).size) {
    ctx.addIssue({
      code: "custom",
      message: "No duplicates allowed.",
      input: val,
    });
  }
});
```

#### `.check()`

Low-level refinement API:

```ts
const UniqueStringArray = z.array(z.string()).check((ctx) => {
  if (ctx.value.length > 3) {
    ctx.issues.push({
      code: "too_big",
      maximum: 3,
      origin: "array",
      inclusive: true,
      message: "Too many items",
      input: ctx.value
    });
  }
});
```

### Transforms

Unidirectional data transformation:

```ts
const castToString = z.transform((val) => String(val));

castToString.parse("asdf"); // => "asdf"
castToString.parse(123);    // => "123"
castToString.parse(true);   // => "true"
```

With validation in transform:

```ts
const coercedInt = z.transform((val, ctx) => {
  try {
    return Number.parseInt(String(val));
  } catch (e) {
    ctx.issues.push({
      code: "custom",
      message: "Not a number",
      input: val,
    });
    return z.NEVER; // Special constant to exit without affecting return type
  }
});
```

#### `.transform()` method

Common pattern: pipe schema into transform:

```ts
const stringToLength = z.string().transform(val => val.length);
stringToLength.parse("hello"); // => 5

// Async transform
const idToUser = z.string().transform(async (id) => {
  return await db.getUserById(id);
});
```

#### `z.preprocess()`

Pipe transform into schema:

```ts
const coercedInt = z.preprocess((val) => {
  if (typeof val === "string") {
    return Number.parseInt(val);
  }
  return val;
}, z.int());
```

### Pipes

Chain schemas together:

```ts
const stringToLength = z.string().pipe(z.transform(val => val.length));
stringToLength.parse("hello"); // => 5
```

### Codecs

Bidirectional transformations (new in Zod 4.1):

```ts
const stringToDate = z.codec(
  z.iso.datetime(),  // input schema
  z.date(),          // output schema
  {
    decode: (isoString) => new Date(isoString), // forward
    encode: (date) => date.toISOString(),       // backward
  }
);

// Forward transform (parse/decode)
stringToDate.parse("2024-01-15T10:30:00.000Z"); // => Date
z.decode(stringToDate, "2024-01-15T10:30:00.000Z"); // => Date (typed input)

// Backward transform (encode)
z.encode(stringToDate, new Date("2024-01-15")); // => "2024-01-15T00:00:00.000Z"
```

Common codec implementations:

```ts
// String to number
const stringToNumber = z.codec(z.string().regex(z.regexes.number), z.number(), {
  decode: (str) => Number.parseFloat(str),
  encode: (num) => num.toString(),
});

// ISO datetime to Date
const isoDatetimeToDate = z.codec(z.iso.datetime(), z.date(), {
  decode: (isoString) => new Date(isoString),
  encode: (date) => date.toISOString(),
});

// JSON codec
const jsonCodec = <T extends z.core.$ZodType>(schema: T) =>
  z.codec(z.string(), schema, {
    decode: (jsonString, ctx) => {
      try {
        return JSON.parse(jsonString);
      } catch (err: any) {
        ctx.issues.push({
          code: "invalid_format",
          format: "json",
          input: jsonString,
          message: err.message,
        });
        return z.NEVER;
      }
    },
    encode: (value) => JSON.stringify(value),
  });
```

### Defaults & Prefaults

#### `.default()`

Set default for `undefined` inputs (short-circuits parsing):

```ts
const defaultTuna = z.string().default("tuna");
defaultTuna.parse(undefined); // => "tuna"

// Function default (re-evaluated each time)
const randomDefault = z.number().default(Math.random);
randomDefault.parse(undefined); // => 0.4413...
randomDefault.parse(undefined); // => 0.1871...
```

#### `.prefault()`

Pre-parse default (does NOT short-circuit, value is parsed):

```ts
const schema = z.string().transform(val => val.length).prefault("tuna");
schema.parse(undefined); // => 4

// With mutating refinements
const a = z.string().trim().toUpperCase().prefault("  tuna  ");
a.parse(undefined); // => "TUNA"
```

### Catch

Fallback value on validation error:

```ts
const numberWithCatch = z.number().catch(42);

numberWithCatch.parse(5);      // => 5
numberWithCatch.parse("tuna"); // => 42

// Function catch
const numberWithRandomCatch = z.number().catch((ctx) => {
  ctx.error; // the caught ZodError
  return Math.random();
});
```

### Branded Types

Simulate nominal typing:

```ts
const Cat = z.object({ name: z.string() }).brand<"Cat">();
const Dog = z.object({ name: z.string() }).brand<"Dog">();

type Cat = z.infer<typeof Cat>; // { name: string } & z.$brand<"Cat">
type Dog = z.infer<typeof Dog>; // { name: string } & z.$brand<"Dog">

const pluto = Dog.parse({ name: "pluto" });
const simba: Cat = pluto; // Error: not allowed
```

### Readonly

Mark schemas as readonly:

```ts
const ReadonlyUser = z.object({ name: z.string() }).readonly();
type ReadonlyUser = z.infer<typeof ReadonlyUser>;
// Readonly<{ name: string }>

// Arrays, tuples, maps, sets also supported
z.array(z.string()).readonly(); // readonly string[]
z.tuple([z.string(), z.number()]).readonly(); // readonly [string, number]
z.map(z.string(), z.date()).readonly(); // ReadonlyMap<string, Date>
z.set(z.string()).readonly(); // ReadonlySet<string>
```

Results are frozen with `Object.freeze()`.

---

## Error Handling

### ZodError

Validation errors are `ZodError` instances with an `.issues` array:

```ts
const result = z.string().safeParse(12);
result.error.issues;
// [
//   {
//     expected: 'string',
//     code: 'invalid_type',
//     path: [],
//     message: 'Invalid input: expected string, received number'
//   }
// ]
```

Issue types:

```ts
type IssueFormats =
  | z.core.$ZodIssueInvalidType
  | z.core.$ZodIssueTooBig
  | z.core.$ZodIssueTooSmall
  | z.core.$ZodIssueInvalidStringFormat
  | z.core.$ZodIssueNotMultipleOf
  | z.core.$ZodIssueUnrecognizedKeys
  | z.core.$ZodIssueInvalidValue
  | z.core.$ZodIssueInvalidUnion
  | z.core.$ZodIssueInvalidKey
  | z.core.$ZodIssueInvalidElement
  | z.core.$ZodIssueCustom;
```

Base issue interface:

```ts
interface $ZodIssueBase {
  readonly code?: string;
  readonly input?: unknown;
  readonly path: PropertyKey[];
  readonly message: string;
}
```

### Error Customization

#### Schema-level Errors

```ts
z.string("Not a string!");

// All APIs accept error param
z.string({ error: "Bad!" });
z.string().min(5, { error: "Too short!" });
z.uuid({ error: "Bad UUID!" });
z.array(z.string(), { error: "Bad array!" });
```

#### Error Map Function

```ts
z.string({
  error: (iss) => iss.input === undefined ? "Field is required." : "Invalid input."
});

// Access issue properties
z.string().min(5, {
  error: (iss) => {
    iss.code;      // issue code
    iss.input;     // input data
    iss.minimum;   // minimum value (for too_small)
    return `Password must have ${iss.minimum} characters or more`;
  },
});

// Return undefined to use default
z.int64({
  error: (issue) => {
    if (issue.code === "too_big") {
      return `Value must be <${issue.maximum}`;
    }
    return undefined; // defer to default
  },
});
```

#### Per-Parse Errors

```ts
z.string().parse(12, {
  error: (iss) => "per-parse custom error"
});
```

**Note:** Schema-level errors have higher precedence than per-parse errors.

#### Global Errors

```ts
z.config({
  customError: (iss) => {
    if (iss.code === "invalid_type") {
      return `invalid type, expected ${iss.expected}`;
    }
    if (iss.code === "too_small") {
      return `minimum is ${iss.minimum}`;
    }
  },
});
```

#### Include Input in Issues

```ts
z.string().parse(12, { reportInput: true });
// ZodError: [{ ..., "input": 12 }]
```

### Error Formatting

#### `z.treeifyError()`

Convert error to nested object:

```ts
const tree = z.treeifyError(result.error);
// {
//   errors: ['Unrecognized key: "extraKey"'],
//   properties: {
//     username: { errors: ['Invalid input: expected string'] },
//     favoriteNumbers: {
//       errors: [],
//       items: [undefined, { errors: ['Invalid input: expected number'] }]
//     }
//   }
// }

tree.properties?.username?.errors;
// => ["Invalid input: expected string"]
```

#### `z.prettifyError()`

Human-readable string:

```ts
const pretty = z.prettifyError(result.error);
// ✖ Unrecognized key: "extraKey"
// ✖ Invalid input: expected string, received number
//   → at username
// ✖ Invalid input: expected number, received string
//   → at favoriteNumbers[1]
```

#### `z.flattenError()`

Shallow error object for flat schemas:

```ts
const flattened = z.flattenError(result.error);
// {
//   formErrors: ['Unrecognized key: "extraKey"'],
//   fieldErrors: {
//     username: ['Invalid input: expected string'],
//     favoriteNumbers: ['Invalid input: expected number']
//   }
// }
```

### Internationalization

```ts
import * as z from "zod";
import { en } from "zod/locales";

z.config(en());

// Or use z.locales
z.config(z.locales.en());
```

Available locales: `ar`, `az`, `be`, `bg`, `ca`, `cs`, `da`, `de`, `en`, `eo`, `es`, `fa`, `fi`, `fr`, `frCA`, `he`, `hu`, `id`, `is`, `it`, `ja`, `ka`, `km`, `ko`, `lt`, `mk`, `ms`, `nl`, `no`, `ota`, `ps`, `pl`, `pt`, `ru`, `sl`, `sv`, `ta`, `th`, `tr`, `uk`, `ur`, `vi`, `zhCN`, `zhTW`, `yo`

Lazy loading:

```ts
async function loadLocale(locale: string) {
  const { default: localeData } = await import(`zod/v4/locales/${locale}.js`);
  z.config(localeData());
}
await loadLocale("fr");
```

---

## JSON Schema

### Convert Zod to JSON Schema

```ts
import * as z from "zod";

const schema = z.object({
  name: z.string(),
  age: z.number(),
});

z.toJSONSchema(schema);
// {
//   type: 'object',
//   properties: { name: { type: 'string' }, age: { type: 'number' } },
//   required: ['name', 'age'],
//   additionalProperties: false,
// }
```

#### Options

```ts
z.toJSONSchema(schema, {
  target: "draft-2020-12",  // or "draft-07", "draft-04", "openapi-3.0"
  io: "output",             // or "input" for input type
  unrepresentable: "throw", // or "any" to convert to {}
  cycles: "ref",            // or "throw"
  reused: "inline",         // or "ref" to extract to $defs
});
```

#### With Metadata

```ts
const emailSchema = z.string().meta({
  title: "Email address",
  description: "Your email address",
});

z.toJSONSchema(emailSchema);
// { type: "string", title: "Email address", description: "Your email address" }
```

#### Override Conversion

```ts
z.toJSONSchema(z.date(), {
  unrepresentable: "any",
  override: (ctx) => {
    if (ctx.zodSchema._zod.def.type === "date") {
      ctx.jsonSchema.type = "string";
      ctx.jsonSchema.format = "date-time";
    }
  },
});
```

### Convert JSON Schema to Zod

```ts
const jsonSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "number" },
  },
  required: ["name", "age"],
};

const zodSchema = z.fromJSONSchema(jsonSchema);
```

### Unrepresentable Types

These types cannot be converted to JSON Schema:

```ts
z.bigint();
z.int64();
z.symbol();
z.undefined();
z.void();
z.date();
z.map();
z.set();
z.transform();
z.nan();
z.custom();
```

---

## Metadata & Registries

### Creating Registries

```ts
const myRegistry = z.registry<{ description: string }>();

const mySchema = z.string();

// Add to registry
myRegistry.add(mySchema, { description: "A cool schema!" });

// Check if exists
myRegistry.has(mySchema); // true

// Get metadata
myRegistry.get(mySchema); // { description: "A cool schema!" }

// Remove
myRegistry.remove(mySchema);

// Clear all
myRegistry.clear();
```

### `.register()` Method

```ts
const mySchema = z.string();
mySchema.register(myRegistry, { description: "A cool schema!" });
// Returns original schema (not a clone!)

// Inline registration
const mySchema = z.object({
  name: z.string().register(myRegistry, { description: "User's name" }),
  age: z.number().register(myRegistry, { description: "User's age" }),
});
```

### Global Registry

```ts
z.globalRegistry.add(z.string(), {
  id: "email_address",
  title: "Email address",
  description: "Your email address",
  examples: ["first.last@example.com"]
});
```

### `.meta()` Method

Convenience for `z.globalRegistry`:

```ts
const emailSchema = z.email().meta({
  id: "email_address",
  title: "Email address",
  description: "Please enter a valid email address",
});

// Retrieve metadata
emailSchema.meta();
// { id: "email_address", title: "Email address", ... }
```

### `.describe()` Method

Shorthand for description only:

```ts
z.email().describe("An email address");
// equivalent to
z.email().meta({ description: "An email address" });
```

### Custom Registry Types

```ts
// Reference inferred type
type MyMeta = { examples: z.$output[] };
const myRegistry = z.registry<MyMeta>();

myRegistry.add(z.string(), { examples: ["hello", "world"] });
myRegistry.add(z.number(), { examples: [1, 2, 3] });

// Constrain schema types
const stringRegistry = z.registry<{ description: string }, z.ZodString>();
stringRegistry.add(z.string(), { description: "OK" });
stringRegistry.add(z.number(), { description: "Error" }); // Error!
```

---

## Zod Mini

Tree-shakable variant with functional API:

```ts
import * as z from "zod/mini";

// Functions instead of methods
const mySchema = z.nullable(z.optional(z.string()));

// Regular Zod equivalent:
// z.string().optional().nullable()
```

### API Differences

```ts
// Regular Zod
z.string().min(5).max(10).trim();

// Zod Mini
z.string().check(z.minLength(5), z.maxLength(10), z.trim());
```

### Available Checks in Zod Mini

```ts
z.lt(value);
z.lte(value);        // alias: z.maximum()
z.gt(value);
z.gte(value);        // alias: z.minimum()
z.positive();
z.negative();
z.nonpositive();
z.nonnegative();
z.multipleOf(value);
z.maxSize(value);
z.minSize(value);
z.size(value);
z.maxLength(value);
z.minLength(value);
z.length(value);
z.regex(regex);
z.lowercase();
z.uppercase();
z.includes(value);
z.startsWith(value);
z.endsWith(value);
z.property(key, schema);
z.mime(value);

// Custom checks
z.refine();
z.check();

// Mutations
z.overwrite(value => newValue);
z.normalize();
z.trim();
z.toLowerCase();
z.toUpperCase();
```

### No Default Locale

Zod Mini doesn't auto-load English locale:

```ts
import * as z from "zod/mini";

z.config(z.locales.en()); // Must load explicitly
```

### Bundle Size Comparison

| Package | Bundle (gzip) |
|---------|---------------|
| Zod 3   | 12.47kb       |
| Zod 4   | 5.36kb        |
| Zod Mini| 1.88kb        |

---

## Zod Core

Low-level package for library authors:

```ts
import * as z from "zod/v4/core";

// Base classes
z.$ZodType;
z.$ZodString;
z.$ZodObject;
z.$ZodArray;
z.$ZodCheck;
z.$ZodError;

// Parsing
z.parse(schema, data);
z.safeParse(schema, data);
await z.parseAsync(schema, data);
await z.safeParseAsync(schema, data);
```

### Schema Types Union

```ts
type $ZodTypes =
  | $ZodString
  | $ZodNumber
  | $ZodBigInt
  | $ZodBoolean
  | $ZodDate
  | $ZodSymbol
  | $ZodUndefined
  | $ZodNullable
  | $ZodNull
  | $ZodAny
  | $ZodUnknown
  | $ZodNever
  | $ZodVoid
  | $ZodArray
  | $ZodObject
  | $ZodUnion
  | $ZodIntersection
  | $ZodTuple
  | $ZodRecord
  | $ZodMap
  | $ZodSet
  | $ZodLiteral
  | $ZodEnum
  | $ZodPromise
  | $ZodLazy
  | $ZodOptional
  | $ZodDefault
  | $ZodTemplateLiteral
  | $ZodCustom
  | $ZodTransform
  | $ZodNonOptional
  | $ZodReadonly
  | $ZodNaN
  | $ZodPipe
  | $ZodSuccess
  | $ZodCatch
  | $ZodFile;
```

### Internals

```ts
const schema = z.string();

schema._zod.def;        // Schema definition
schema._zod.def.type;   // "string", "object", etc.
schema._zod.def.checks; // Array of checks
schema._zod.input;      // Virtual: inferred input type
schema._zod.output;     // Virtual: inferred output type
schema._zod.run();      // Internal parser
```

---

## For Library Authors

### Peer Dependencies

```json
{
  "peerDependencies": {
    "zod": "^3.25.0 || ^4.0.0"
  },
  "devDependencies": {
    "zod": "^3.25.0 || ^4.0.0"
  }
}
```

### Import from Subpaths

```ts
import * as z3 from "zod/v3";
import * as z4 from "zod/v4/core";
```

### Support Both Zod 3 and 4

```ts
import * as z3 from "zod/v3";
import * as z4 from "zod/v4/core";

type Schema = z3.ZodTypeAny | z4.$ZodType;

function acceptUserSchema(schema: z3.ZodTypeAny | z4.$ZodType) {
  // Differentiate at runtime
  if ("_zod" in schema) {
    schema._zod.def; // Zod 4
  } else {
    schema._def; // Zod 3
  }
}
```

### Accept User-Defined Schemas

```ts
// Correct: extend the type
function inferSchema<T extends z4.$ZodType>(schema: T) {
  return schema;
}
inferSchema(z.string()); // => ZodString

// Wrong: loses type information
function inferSchema<T>(schema: z4.$ZodType<T>) {
  return schema;
}
inferSchema(z.string()); // => $ZodType<string>
```

---

## Migration from Zod 3 to Zod 4

### Installation

```sh
npm install zod@^4.0.0
```

### Error Customization Changes

```ts
// Zod 3
z.string().min(5, { message: "Too short." });

// Zod 4
z.string().min(5, { error: "Too short." });
```

```ts
// Zod 3
z.string({
  required_error: "Required",
  invalid_type_error: "Not a string",
});

// Zod 4
z.string({
  error: (issue) => issue.input === undefined
    ? "Required"
    : "Not a string"
});
```

```ts
// Zod 3
z.string({ errorMap: (issue, ctx) => ({ message: "..." }) });

// Zod 4
z.string({ error: (issue) => "..." });
```

### Deprecated APIs

| Zod 3 | Zod 4 |
|-------|-------|
| `z.string().email()` | `z.email()` |
| `z.string().uuid()` | `z.uuid()` |
| `z.string().url()` | `z.url()` |
| `z.string().ip()` | `z.ipv4()` / `z.ipv6()` |
| `z.nativeEnum()` | `z.enum()` |
| `z.object().strict()` | `z.strictObject()` |
| `z.object().passthrough()` | `z.looseObject()` |
| `z.object().merge()` | `.extend()` or spread syntax |
| `z.object().deepPartial()` | Removed |
| `error.format()` | `z.treeifyError()` |
| `error.flatten()` | `z.flattenError()` |

### Breaking Changes

- `z.number()`: No longer accepts `Infinity`
- `z.number().int()`: Only accepts safe integers
- `z.coerce` schemas: Input type is now `unknown`
- `.default()`: Short-circuits parsing (value must match output type)
- Object defaults: Applied within optional fields
- `z.record()`: Requires both key and value schema
- `z.record(enum)`: Now exhaustively checks keys
- `z.intersection()`: Throws `Error` (not `ZodError`) on merge conflict
- `z.array().nonempty()`: No longer changes inferred type
- `z.function()`: Returns function factory, not schema

### Internal Changes

- `._def` moved to `._zod.def`
- `ZodEffects` removed (refinements stored in schemas)
- `ZodBranded` removed (branding is type-only)
- `ZodPreprocess` removed (use `ZodPipe`)
- Base class: `ZodType<Output, Input>` (no `Def` generic)

---

## Functions

### `z.function()`

Create Zod-validated functions:

```ts
const MyFunction = z.function({
  input: [z.string()],
  output: z.number()
});

const computeLength = MyFunction.implement((input) => {
  return input.trim().length;
});

computeLength("sandwich"); // => 8
computeLength(42); // throws ZodError

// Async function
const asyncFn = MyFunction.implementAsync(async (input) => {
  return input.trim().length;
});
```

### `z.custom()`

Create schema for any TypeScript type:

```ts
const px = z.custom<`${number}px`>((val) => {
  return typeof val === "string" ? /^\d+px$/.test(val) : false;
});

type px = z.infer<typeof px>; // `${number}px`

px.parse("42px"); // "42px"
px.parse("42vw"); // throws
```

### `z.instanceof()`

Validate class instances:

```ts
class Test {
  name: string;
}

const TestSchema = z.instanceof(Test);

TestSchema.parse(new Test()); // OK
TestSchema.parse("whatever"); // Error

// With property validation
z.instanceof(URL).check(
  z.property("protocol", z.literal("https:"))
);
```

### `z.lazy()`

Lazy schema evaluation (for recursion):

```ts
const Category = z.lazy(() => z.object({
  name: z.string(),
  subcategories: z.array(Category)
}));
```

### `z.json()`

Validate any JSON-encodable value:

```ts
const jsonSchema = z.json();
// Equivalent to:
// z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(jsonSchema), z.record(z.string(), jsonSchema)])
```

---

## Quick Reference

### All Schema Types

```ts
// Primitives
z.string()
z.number()
z.bigint()
z.boolean()
z.symbol()
z.undefined()
z.null()
z.void()
z.any()
z.unknown()
z.never()
z.nan()

// Literals
z.literal("value")
z.literal(["a", "b", "c"])

// String formats
z.email()
z.uuid()
z.url()
z.httpUrl()
z.hostname()
z.emoji()
z.base64()
z.base64url()
z.hex()
z.jwt()
z.nanoid()
z.cuid()
z.cuid2()
z.ulid()
z.ipv4()
z.ipv6()
z.mac()
z.cidrv4()
z.cidrv6()
z.hash("sha256")
z.iso.date()
z.iso.time()
z.iso.datetime()
z.iso.duration()

// Numbers
z.int()
z.int32()
z.uint32()
z.int64()
z.uint64()
z.float32()
z.float64()

// Complex
z.object({ ... })
z.strictObject({ ... })
z.looseObject({ ... })
z.array(schema)
z.tuple([schemas])
z.record(keySchema, valueSchema)
z.partialRecord(keySchema, valueSchema)
z.looseRecord(keySchema, valueSchema)
z.map(keySchema, valueSchema)
z.set(schema)
z.enum(["a", "b"])
z.union([schemas])
z.xor([schemas])
z.discriminatedUnion("key", [schemas])
z.intersection(a, b)
z.file()
z.date()

// Wrappers
z.optional(schema)
z.nullable(schema)
z.nullish(schema)
z.readonly(schema)

// Transforms
z.transform(fn)
z.preprocess(fn, schema)
z.codec(input, output, { decode, encode })
z.pipe(a, b)

// Special
z.lazy(() => schema)
z.custom<Type>(validator)
z.instanceof(Class)
z.json()
z.stringbool()
z.templateLiteral([parts])
z.stringFormat("name", validator)
z.function({ input, output })
```

### Common Methods

```ts
schema.parse(data)
schema.safeParse(data)
schema.parseAsync(data)
schema.safeParseAsync(data)

schema.optional()
schema.nullable()
schema.nullish()
schema.array()
schema.or(other)
schema.and(other)
schema.transform(fn)
schema.default(value)
schema.prefault(value)
schema.catch(value)
schema.refine(fn, options)
schema.superRefine(fn)
schema.check(fn)
schema.pipe(other)
schema.readonly()
schema.brand<"Name">()

schema.meta(data)
schema.describe(description)
schema.register(registry, metadata)
```

### Utility Functions

```ts
z.infer<typeof schema>
z.input<typeof schema>
z.output<typeof schema>

z.parse(schema, data)
z.safeParse(schema, data)
z.decode(schema, data)
z.encode(schema, data)

z.toJSONSchema(schema, options)
z.fromJSONSchema(jsonSchema)

z.treeifyError(error)
z.prettifyError(error)
z.flattenError(error)

z.config(options)
z.registry<Meta>()
z.globalRegistry
```
