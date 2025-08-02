// Mock Roblox API implementations for the sandbox

export class Vector3 {
  constructor(public X: number = 0, public Y: number = 0, public Z: number = 0) {}

  static new(x: number = 0, y: number = 0, z: number = 0): Vector3 {
    return new Vector3(x, y, z);
  }

  toString(): string {
    return `${this.X}, ${this.Y}, ${this.Z}`;
  }
}

export class CFrame {
  constructor(
    public X: number = 0,
    public Y: number = 0,
    public Z: number = 0,
    public LookVector: Vector3 = new Vector3(0, 0, -1)
  ) {}

  static new(x: number = 0, y: number = 0, z: number = 0): CFrame {
    return new CFrame(x, y, z);
  }
}

export class BrickColor {
  constructor(public Name: string, public Color: { r: number; g: number; b: number }) {}

  static new(colorName: string): BrickColor {
    const colors: { [key: string]: { r: number; g: number; b: number } } = {
      'Bright red': { r: 1, g: 0, b: 0 },
      'Bright blue': { r: 0, g: 0, b: 1 },
      'Bright green': { r: 0, g: 1, b: 0 },
      'Bright yellow': { r: 1, g: 1, b: 0 },
      'White': { r: 1, g: 1, b: 1 },
      'Black': { r: 0, g: 0, b: 0 },
    };
    
    return new BrickColor(colorName, colors[colorName] || { r: 0.5, g: 0.5, b: 0.5 });
  }
}

export class Color3 {
  constructor(public r: number = 0, public g: number = 0, public b: number = 0) {}

  static new(r: number = 0, g: number = 0, b: number = 0): Color3 {
    return new Color3(r, g, b);
  }
}

export class Instance {
  public Name: string = '';
  public ClassName: string = '';
  public Parent: Instance | null = null;
  public Children: Instance[] = [];

  constructor(className: string) {
    this.ClassName = className;
    this.Name = className;
  }

  static new(className: string): Instance {
    switch (className) {
      case 'Part':
        return new Part();
      case 'Humanoid':
        return new Humanoid();
      case 'Model':
        return new Model();
      default:
        return new Instance(className);
    }
  }

  static find(name: string): Instance | null {
    // Mock implementation
    return null;
  }

  Destroy(): void {
    if (this.Parent) {
      const index = this.Parent.Children.indexOf(this);
      if (index > -1) {
        this.Parent.Children.splice(index, 1);
      }
    }
    this.Parent = null;
    this.Children = [];
  }
}

export class Part extends Instance {
  public Size: Vector3 = new Vector3(4, 1.2, 2);
  public Position: Vector3 = new Vector3(0, 0, 0);
  public BrickColor: BrickColor = BrickColor.new('Medium stone grey');
  public Material: string = 'Plastic';
  public CanCollide: boolean = true;
  public Anchored: boolean = false;

  constructor() {
    super('Part');
    this.Name = 'Part';
  }
}

export class Humanoid extends Instance {
  public Health: number = 100;
  public MaxHealth: number = 100;
  public WalkSpeed: number = 16;
  public JumpPower: number = 50;

  constructor() {
    super('Humanoid');
    this.Name = 'Humanoid';
  }

  TakeDamage(damage: number): void {
    this.Health = Math.max(0, this.Health - damage);
  }
}

export class Model extends Instance {
  public PrimaryPart: Part | null = null;

  constructor() {
    super('Model');
    this.Name = 'Model';
  }
}

export class RemoteEvent extends Instance {
  constructor() {
    super('RemoteEvent');
    this.Name = 'RemoteEvent';
  }

  FireServer(...args: any[]): void {
    console.log('RemoteEvent:FireServer called with:', args);
  }

  FireClient(player: any, ...args: any[]): void {
    console.log('RemoteEvent:FireClient called with:', player, args);
  }
}

export function createRobloxAPI() {
  return {
    // Constructors
    Instance,
    Vector3,
    CFrame,
    BrickColor,
    Color3,
    Part,
    Humanoid,
    Model,
    RemoteEvent,

    // Functions
    print: (...args: any[]) => {
      console.log(...args);
    },
    warn: (...args: any[]) => {
      console.warn(...args);
    },
    wait: (seconds: number = 0) => {
      // Note: In a real implementation, this would need to be async
      return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    },
    
    // Mock workspace
    workspace: {
      Name: 'Workspace',
      ClassName: 'Workspace',
      Children: [] as Instance[],
      FindFirstChild: (name: string) => null,
    },

    // Mock game services
    game: {
      Workspace: {
        Name: 'Workspace',
        ClassName: 'Workspace',
      },
      Players: {
        Name: 'Players',
        ClassName: 'Players',
        LocalPlayer: {
          Name: 'Player',
          ClassName: 'Player',
        },
      },
      ReplicatedStorage: {
        Name: 'ReplicatedStorage',
        ClassName: 'ReplicatedStorage',
      },
    },

    // Blocked/restricted functions (will throw errors)
    io: new Proxy({}, {
      get() {
        throw new Error('Access to io library is blocked for security');
      }
    }),
    os: new Proxy({}, {
      get() {
        throw new Error('Access to os library is blocked for security');
      }
    }),
    debug: new Proxy({}, {
      get() {
        throw new Error('Access to debug library is blocked for security');
      }
    }),
    require: () => {
      throw new Error('require() is blocked for security');
    },
    dofile: () => {
      throw new Error('dofile() is blocked for security');
    },
    loadfile: () => {
      throw new Error('loadfile() is blocked for security');
    },
  };
}
