using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerController : MonoBehaviour {
    private Rigidbody rb;
    private Touch finger;
    public float speed;
    public float fire_rate;
    public GameObject shot;
    public Transform shot_spawn;
    bool currentisAndroid = false;
    private float nextfire = 0.0f;
    private void Start()
    {
        rb = GetComponent<Rigidbody>();

#if UNITY_EDITOR
        currentisAndroid = false;
#else
        currentisAndroid = true;
#endif
    }

    private void Update()
    {
        if(Time.time > nextfire)
        {
            nextfire = Time.time + fire_rate;
            Instantiate(shot, shot_spawn.position, shot_spawn.rotation);
        }
    }

    private void FixedUpdate()
    {
        if(currentisAndroid)
        {
            finger = Input.GetTouch(0);
            if (finger.position.x < (this.transform.position.x + Screen.width / 2) && finger.phase == TouchPhase.Stationary)
                MoveLeft();
            else if (finger.position.x > (this.transform.position.x + Screen.width / 2) && finger.phase == TouchPhase.Stationary)
                MoveRight();
            else
                MoveStop();
        }
        else
        {
            float moveHorizontal = Input.GetAxis("Horizontal");
            float moveVertical = Input.GetAxis("Vertical");

            Vector3 movement = new Vector3(moveHorizontal, 0.0f, moveVertical);
            rb.velocity = movement * speed;
        }
        
    }

    private void MoveLeft()
    {
        Vector3 movement = new Vector3(-1.0f, 0.0f, 0.0f);
        rb.velocity = movement * speed;
    }

    private void MoveRight()
    {
        Vector3 movement = new Vector3(1.0f, 0.0f, 0.0f);
        rb.velocity = movement * speed;
    }

    private void MoveStop()
    {
        Vector3 movement = new Vector3(0.0f, 0.0f, 0.0f);
        rb.velocity = movement * speed;
    }
}
