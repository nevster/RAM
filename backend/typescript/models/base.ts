import * as mongoose from 'mongoose';

/* tslint:disable:no-var-requires */ const mongooseUniqueValidator = require('mongoose-unique-validator');
/* tslint:disable:no-var-requires */ const mongooseIdValidator = require('mongoose-id-validator');
/* tslint:disable:no-var-requires */ const mongooseDeepPopulate = require('mongoose-deep-populate')(mongoose);

/**
 * A convenience class to build a query object, only adding criteria when specified.
 */
export class Query {
    private data = {};

    /**
     * Adds the given filter (name:value) only if 'add' is truthy.
     */
    public add(name:string, value:Object, add:Object):Query {
        if(add) {
            this.data[name] = value;
        }
        return this;
    }
    
    public build():Object {
        return this.data;
    }
}
/* RAMEnum is a simple class construct that represents a enumerated type so we can work with classes not strings.
 */
export class RAMEnum {

    protected static AllValues: RAMEnum[];

    public static values<T extends RAMEnum>():T[] {
        return this.AllValues as T[];
    }

    public static valueStrings<T extends RAMEnum>():String[] {
        return this.AllValues.map((value:T) => value.name);
    }

    public static valueOf<T extends RAMEnum>(name:String):T {
        for (let type of this.AllValues) {
            if ((type as T).name === name) {
                return type as T;
            }
        }
        return null;
    }

    constructor(public name:String) {
    }
}

/* A RAMObject defines the common attributes that all objects in the RAM
 * model will contain.
 * Most objects in RAM extend off the RAMObject
 */
export interface IRAMObject extends mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
  deleteInd: boolean;
  resourceVersion: string;

  /** Instance methods */
  delete(): void;
}

export const RAMSchema = (schema: Object) => {

  const result = new mongoose.Schema({
    deleteInd: { type: Boolean, default: false },
    resourceVersion: { type: String, default: '1' }
  }, { timestamps: true });

  result.add(schema);

  result.plugin(mongooseIdValidator);
  result.plugin(mongooseDeepPopulate);

  result.method('delete', function () {
    this.deleteInd = true;
    this.save();
  });

  return result;
};

export interface ICodeDecode extends mongoose.Document {
  shortDecodeText: string;
  longDecodeText: string;
  startDate: Date;
  endDate: Date;
  code: string;

  /** Instance methods below */

}

/* tslint:disable:max-func-body-length */
export const CodeDecodeSchema = (schema: Object) => {

  const result = new mongoose.Schema({
    shortDecodeText: {
      type: String,
      required: [true, 'Short description text is required'],
      trim: true
    },
    longDecodeText: {
      type: String,
      required: [true, 'Long description text is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Code is required and must be string and unique'],
      trim: true,
      index: { unique: true }
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date
    }
  });

  result.add(schema);

  result.plugin(mongooseIdValidator);
  result.plugin(mongooseDeepPopulate);
  result.plugin(mongooseUniqueValidator);

  return result;
};
