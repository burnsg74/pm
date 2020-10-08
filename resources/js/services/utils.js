//snakeToCamel
//camelToSnake
//isObject
//deepEqual
//findByMatchingProperties
//formatStartDateForBackend
//formatScheduleDateForBackend

export function snakeToCamel(str) {
    return str.replace(
        /([-_][a-z])/g,
        (group) => group.toUpperCase()
            .replace('-', '')
            .replace('_', '')
    );
}

export function camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export function isObject(object) {
    return object != null && typeof object === 'object';
}

export function deepEqual(object1, object2) {
    if (!object1 && !object2) return true;
    if (!object1 || !object2) return false;
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        const val1 = object1[key];
        const val2 = object2[key];
        const areObjects = isObject(val1) && isObject(val2);
        if (
            areObjects && !deepEqual(val1, val2) ||
            !areObjects && val1 !== val2
        ) {
            return false;
        }
    }

    return true;
}

export function findByMatchingProperties(set, properties) {
    if (Object.keys(properties).length === 0) return set;

    return set.filter(function (entry) {
        return Object.keys(properties).every(function (key) {
            return entry[key] === properties[key];
        });
    });
}

export function formatStartDateForBackend(datestring) {
    let date = null;
    if (!datestring) {
        date = new Date();
    } else {
        date = new Date(datestring);
    }
    let dd = String(date.getDate()).padStart(2, '0');
    let mm = String(date.getMonth() + 1).padStart(2, '0');
    let yyyy = date.getFullYear();

    return yyyy + '-' + mm + '-' + dd;
}

export function formatScheduleDateForBackend(datestring) {
    let date = null;
    if (!datestring) {
        date = new Date();
    } else {
        date = new Date(datestring);
    }
    let dd = String(date.getDate()).padStart(2, '0');
    let mm = String(date.getMonth() + 1).padStart(2, '0');

    return mm + '-' + dd;
}