<?php

namespace Tests\Fixtures;

use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;

/**
 * The shipped User model does not enforce email verification. This fixture
 * flips it on so the "unverified user cannot log in" path can be tested.
 */
class VerifiableUser extends User implements MustVerifyEmail
{
    protected $table = 'users';
}
