# Guards

## IsGuest
This guard aborts requests that have a valid JWT attached to the ``Authorization`` header.

## IsLoggedIn
This guard aborts requests that do not have a valid JWT attached to the ``Authorization`` header.

## IsCreator
This guard aborts requests from users that are not the creators of the given deck.

This guard can be applied to any route with an ``id`` variable. The guard does not check if the JWT is valid and must be paired with ``IsLoggedIn`` to prevent errors. It does, however, check if the deck does not exist and will throw a 404 error instead of 403 in this case.

## IsNotCreator
This guard aborts requests from users that are the creators of the given deck.

This guard can be applied to any route with an ``id`` variable. The guard does not check if the JWT is valid and must be paired with ``IsLoggedIn`` to prevent errors. It does, however, check if the deck does not exist and will throw a 404 error instead of 403 in this case.